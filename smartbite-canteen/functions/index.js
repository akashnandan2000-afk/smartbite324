const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// ─── Token helpers ──────────────────────────────────────────────────────────────

/**
 * Zero-pad a number to produce tokens like SB-001, SB-042, SB-1000.
 */
const formatToken = (n) => `SB-${String(n).padStart(3, "0")}`;

/**
 * Cloud Function: generateToken
 *
 * Uses a Firestore transaction on `meta/tokenCounter` to atomically increment
 * a shared counter and return the next sequential token number.
 *
 * Firestore transactions are serialised — even under high concurrency, each
 * call receives a unique, gap-free number. No two orders will ever share a token.
 *
 * Counter document shape:
 *   meta/tokenCounter { current: <number> }
 *
 * Returns: { token: "SB-001", number: 1 }
 */
exports.generateToken = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const db = admin.firestore();
      const counterRef = db.collection("meta").doc("tokenCounter");

      // Atomic read-increment-write — safe under simultaneous requests
      const newNumber = await db.runTransaction(async (tx) => {
        const snap = await tx.get(counterRef);
        const current = snap.exists ? (snap.data().current || 0) : 0;
        const next = current + 1;
        tx.set(counterRef, { current: next, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        return next;
      });

      const token = formatToken(newNumber);
      console.log(`[generateToken] Allocated token ${token}`);
      return res.status(200).json({ token, number: newNumber });
    } catch (error) {
      console.error("[generateToken] Error:", error);
      return res.status(500).json({ error: error.message || "Token generation failed" });
    }
  });
});

// Initialize Razorpay with Test / Live keys
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret"
  });
};

/**
 * Cloud Function to create Razorpay Order
 */
exports.createRazorpayOrder = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { amount, currency = "INR", receipt, notes } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required" });
      }

      const instance = getRazorpayInstance();
      const options = {
        amount: Math.round(amount * 100), // convert to paise
        currency,
        receipt: receipt || `order_rcptid_${Date.now()}`,
        notes: notes || {}
      };

      const order = await instance.orders.create(options);
      return res.status(200).json(order);
    } catch (error) {
      console.error("Razorpay order error:", error);
      return res.status(500).json({ error: error.message || "Order creation failed" });
    }
  });
});

/**
 * Cloud Function to verify Razorpay signature and update order status
 */
exports.verifyPayment = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const crypto = require("crypto");
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
      // Support both camelCase (new) and snake_case (old Razorpay response)
      const rzpOrderId = razorpayOrderId || req.body.razorpay_order_id;
      const rzpPaymentId = razorpayPaymentId || req.body.razorpay_payment_id;
      const rzpSignature = razorpaySignature || req.body.razorpay_signature;
      const key_secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";

      const generatedSignature = crypto
        .createHmac("sha256", key_secret)
        .update(`${rzpOrderId}|${rzpPaymentId}`)
        .digest("hex");

      const verified = generatedSignature === rzpSignature;

      if (verified && orderId) {
        await admin.firestore().collection("orders").doc(orderId).update({
          paymentStatus: "PAID",
          razorpayPaymentId: rzpPaymentId,
          razorpayOrderId: rzpOrderId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return res.status(200).json({ verified });
    } catch (error) {
      console.error("Payment verification error:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Cloud Function: Staff confirms cash payment.
 * Only callable by users with role: staff or admin (verified via Firebase Auth token).
 *
 * Usage:
 *   POST /confirmCashPayment
 *   Authorization: Bearer <idToken>
 *   Body: { orderId: "ORD-20241031-XXXX" }
 */
exports.confirmCashPayment = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      // 1. Verify Firebase Auth token
      const authHeader = req.headers.authorization || "";
      if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing authorization token" });
      }
      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // 2. Check role from Firestore user profile
      const userSnap = await admin.firestore()
        .collection("users")
        .doc(decodedToken.uid)
        .get();

      if (!userSnap.exists) {
        return res.status(403).json({ error: "User not found" });
      }

      const userRole = userSnap.data().role;
      if (!["staff", "admin"].includes(userRole)) {
        return res.status(403).json({ error: "Access denied: staff or admin only" });
      }

      // 3. Update order paymentStatus to PAID
      const { orderId } = req.body;
      if (!orderId) {
        return res.status(400).json({ error: "orderId is required" });
      }

      await admin.firestore().collection("orders").doc(orderId).update({
        paymentStatus: "PAID",
        confirmedBy: decodedToken.uid,
        confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(200).json({ success: true, orderId, confirmedBy: decodedToken.uid });
    } catch (error) {
      console.error("Cash confirmation error:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});

