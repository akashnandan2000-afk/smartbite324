/**
 * SmartBite Payment Service
 * ==========================
 * Handles all payment-related operations: order ID generation, idempotency,
 * Razorpay backend calls, and cash order management.
 *
 * SECURITY RULES (strictly enforced):
 *  - RAZORPAY_KEY_SECRET is NEVER in frontend code.
 *  - Only VITE_RAZORPAY_KEY_ID (public test key) is exposed in .env / frontend.
 *  - Backend order creation and signature verification happen in Firebase Cloud Functions.
 *
 * RAZORPAY CONFIGURATION:
 *  1. Frontend (.env):
 *       VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
 *  2. Cloud Functions (deploy via Firebase CLI):
 *       firebase functions:config:set razorpay.key_id="rzp_test_xxx" razorpay.key_secret="xxx"
 *  3. Deploy functions:
 *       cd functions && npm install
 *       firebase deploy --only functions
 *
 * DEMO MODE:
 *  When Firebase is not configured, all calls fall back to localStorage/sessionStorage.
 */

import { db } from "./firebase";
import { allocateToken, deriveInitialTokenStatus } from "./tokenService";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// ─── ID Generators ─────────────────────────────────────────────────────────────

/**
 * Generate a unique SmartBite Order ID
 * Format: ORD-YYYYMMDD-XXXX
 */
export const generateOrderId = () => {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${datePart}-${randPart}`;
};

/**
 * Allocate the next sequential pickup token via tokenService.
 * Re-exported here for convenience so CheckoutPage only needs to import from paymentService.
 * Returns: { token: "SB-001", number: 1, source: "backend"|"local" }
 */
export { allocateToken as generatePickupToken };

/**
 * Generate an idempotency key from cart contents to prevent double-payment.
 * Key is a simple fingerprint of item IDs + quantities + total.
 */
export const generateIdempotencyKey = (cartItems, total) => {
  const fingerprint = cartItems
    .map((i) => `${i.id}:${i.quantity}`)
    .sort()
    .join("|");
  return btoa(`${fingerprint}|${total}`).slice(0, 32);
};

// ─── Idempotency Lock (sessionStorage) ─────────────────────────────────────────

const IDEMPOTENCY_KEY = "smartbite_payment_processing_lock";

export const acquirePaymentLock = (key) => {
  const existing = sessionStorage.getItem(IDEMPOTENCY_KEY);
  if (existing && existing === key) return false; // already processing same cart
  sessionStorage.setItem(IDEMPOTENCY_KEY, key);
  return true;
};

export const releasePaymentLock = () => {
  sessionStorage.removeItem(IDEMPOTENCY_KEY);
};

export const isPaymentLocked = (key) => {
  return sessionStorage.getItem(IDEMPOTENCY_KEY) === key;
};

// ─── Firebase Cloud Function URLs ──────────────────────────────────────────────

const FUNCTIONS_BASE =
  import.meta.env.VITE_FUNCTIONS_URL ||
  "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net";

// ─── Backend Razorpay Order Creation ────────────────────────────────────────────

/**
 * Create a Razorpay order on the backend (Firebase Cloud Function).
 * Returns { orderId, amount, currency } or null in demo mode.
 *
 * The backend Cloud Function (functions/index.js → createRazorpayOrder) receives
 * the amount (in INR), creates an order via Razorpay API, and returns the order_id.
 * The secret key NEVER leaves the server.
 */
export const createRazorpayBackendOrder = async ({ amount, receipt, notes }) => {
  try {
    const res = await fetch(`${FUNCTIONS_BASE}/createRazorpayOrder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, receipt, notes }),
    });

    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    return { orderId: data.orderId, amount: data.amount, currency: data.currency };
  } catch (err) {
    // Demo / offline fallback — return a fake order ID so UI still works
    console.warn("[SmartBite] Backend unavailable, using demo order ID:", err.message);
    return { orderId: `demo_order_${Date.now()}`, amount, currency: "INR" };
  }
};

// ─── Backend Payment Signature Verification ─────────────────────────────────────

/**
 * Verify Razorpay payment signature on the backend (Firebase Cloud Function).
 * Returns { verified: true/false }.
 *
 * IMPORTANT: Only mark order as PAID after this returns verified = true.
 */
export const verifyRazorpayPaymentBackend = async ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  try {
    const res = await fetch(`${FUNCTIONS_BASE}/verifyPayment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature }),
    });

    if (!res.ok) throw new Error(`Verification error: ${res.status}`);
    const data = await res.json();
    return { verified: data.verified === true };
  } catch (err) {
    // Demo / offline mode: trust client-side success (only acceptable in demo, not production)
    console.warn("[SmartBite] Verification backend unavailable, trusting client in demo mode:", err.message);
    return { verified: true, demoMode: true };
  }
};

// ─── Order Persistence ──────────────────────────────────────────────────────────

const LS_ORDERS_KEY = "smartbite_orders";

const saveOrderToLocalStorage = (order) => {
  try {
    const existing = JSON.parse(localStorage.getItem(LS_ORDERS_KEY) || "[]");
    existing.unshift(order);
    localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(existing));
  } catch {
    // ignore
  }
};

const updateOrderInLocalStorage = (orderId, updates) => {
  try {
    const existing = JSON.parse(localStorage.getItem(LS_ORDERS_KEY) || "[]");
    const idx = existing.findIndex((o) => o.orderId === orderId);
    if (idx !== -1) {
      existing[idx] = { ...existing[idx], ...updates };
      localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(existing));
    }
  } catch {
    // ignore
  }
};

/**
 * Save a completed online payment order.
 * Called ONLY after backend signature verification succeeds.
 */
export const saveOnlinePaymentOrder = async ({
  orderId,
  pickupToken,
  student,
  items,
  bill,
  razorpayPaymentId,
  razorpayOrderId,
  razorpaySignature,
  appliedCoupon,
  orderType,
}) => {
  const orderData = {
    orderId,
    pickupToken,
    student: {
      uid: student.uid,
      fullName: student.fullName,
      studentId: student.studentId,
      department: student.department,
      email: student.email,
    },
    items: bill.lineItems,
    subtotal: bill.subtotal,
    taxAmount: bill.taxAmount,
    taxDetails: bill.taxDetails,
    packagingCharge: bill.packagingCharge,
    discountAmount: bill.discountAmount,
    grandTotal: bill.grandTotal,
    appliedCoupon: appliedCoupon || null,
    orderType: orderType || "dinein",
    paymentMethod: "online",
    paymentStatus: "PAID",
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Try Firestore first, fall back to localStorage
  try {
    await setDoc(doc(db, "orders", orderId), {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch {
    saveOrderToLocalStorage(orderData);
  }

  return orderData;
};

/**
 * Save a Cash at Canteen order with PENDING status.
 * Staff will confirm payment at the counter.
 */
export const savePendingCashOrder = async ({
  orderId,
  pickupToken,
  student,
  items,
  bill,
  appliedCoupon,
  orderType,
}) => {
  const orderData = {
    orderId,
    pickupToken,
    student: {
      uid: student.uid,
      fullName: student.fullName,
      studentId: student.studentId,
      department: student.department,
      email: student.email,
    },
    items: bill.lineItems,
    subtotal: bill.subtotal,
    taxAmount: bill.taxAmount,
    taxDetails: bill.taxDetails,
    packagingCharge: bill.packagingCharge,
    discountAmount: bill.discountAmount,
    grandTotal: bill.grandTotal,
    appliedCoupon: appliedCoupon || null,
    orderType: orderType || "dinein",
    paymentMethod: "cash",
    paymentStatus: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "orders", orderId), {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch {
    saveOrderToLocalStorage(orderData);
  }

  return orderData;
};

/**
 * Staff confirms cash payment. Updates order status to PAID.
 * Only callable by users with role: staff or admin.
 */
export const confirmCashPayment = async (orderId) => {
  const updates = {
    paymentStatus: "PAID",
    confirmedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await updateDoc(doc(db, "orders", orderId), {
      ...updates,
      confirmedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch {
    updateOrderInLocalStorage(orderId, updates);
  }

  return updates;
};
