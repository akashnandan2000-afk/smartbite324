import { useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingBag,
  CreditCard,
  Banknote,
  CheckCircle2,
  ArrowLeft,
  User,
  MapPin,
  Hash,
  Loader2,
  Lock,
  AlertCircle,
  ChevronRight,
  Smartphone,
  Shield,
  Clock,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { calculateBill } from "../services/billingConfig";
import { openRazorpayPayment } from "../services/razorpay";
import {
  generateOrderId,
  generatePickupToken,
  generateIdempotencyKey,
  acquirePaymentLock,
  releasePaymentLock,
  createRazorpayBackendOrder,
  verifyRazorpayPaymentBackend,
  saveOnlinePaymentOrder,
  savePendingCashOrder,
} from "../services/paymentService";
import { DigitalReceipt } from "../components/DigitalReceipt";
import { formatCurrency } from "../utils/formatters";

// ─── Payment Method Card ────────────────────────────────────────────────────────
const PaymentMethodCard = ({ id, selected, onSelect, icon: Icon, title, subtitle, badge, badgeColor, children }) => (
  <button
    type="button"
    onClick={() => onSelect(id)}
    className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer focus:outline-none ${
      selected
        ? "border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-100"
        : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md"
    }`}
  >
    <div className="flex items-start gap-4">
      {/* Radio Indicator */}
      <div
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          selected ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-white"
        }`}
      >
        {selected && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>

      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
          selected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-bold text-base ${selected ? "text-emerald-900" : "text-slate-800"}`}>
            {title}
          </span>
          {badge && (
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <p className={`text-sm mt-0.5 ${selected ? "text-emerald-700" : "text-slate-500"}`}>{subtitle}</p>
        {selected && children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  </button>
);

// ─── Order Summary Row ──────────────────────────────────────────────────────────
const SummaryRow = ({ label, value, bold, green, red, separator }) => (
  <>
    {separator && <div className="border-t border-slate-100 my-1" />}
    <div className={`flex items-center justify-between py-1 ${bold ? "font-bold" : ""}`}>
      <span className={`text-sm ${bold ? "text-slate-900" : "text-slate-600"}`}>{label}</span>
      <span
        className={`text-sm font-bold ${
          green ? "text-emerald-600" : red ? "text-red-500" : bold ? "text-slate-900 text-base" : "text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  </>
);

// ─── CheckoutPage Component ─────────────────────────────────────────────────────
export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("online"); // "online" | "cash"
  const [orderType, setOrderType] = useState("dinein"); // "dinein" | "takeaway"
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null); // triggers receipt modal

  // Cart empty guard
  const isEmpty = cartItems.length === 0;

  // Retrieve coupon data from CartPage session (stored in sessionStorage by CartPage)
  const appliedCouponRaw = sessionStorage.getItem("smartbite_applied_coupon") || "";
  const discountAmountRaw = Number(sessionStorage.getItem("smartbite_discount_amount") || 0);

  // Compute bill
  const bill = useMemo(
    () =>
      calculateBill({
        items: cartItems,
        orderType,
        discount: discountAmountRaw,
      }),
    [cartItems, orderType, discountAmountRaw]
  );

  // Idempotency key for this specific cart state
  const idempotencyKey = useMemo(
    () => generateIdempotencyKey(cartItems, bill.grandTotal),
    [cartItems, bill.grandTotal]
  );

  // ── Online Payment Handler ────────────────────────────────────────────────────
  const handleOnlinePayment = useCallback(async () => {
    if (!user) {
      setError("Please log in to place an order.");
      return;
    }
    if (isEmpty) {
      setError("Your cart is empty.");
      return;
    }

    // Idempotency check
    if (!acquirePaymentLock(idempotencyKey)) {
      setError("Payment already in progress. Please wait.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const orderId = generateOrderId();
      const pickupToken = generatePickupToken();

      // Step 1: Create Razorpay order on backend (secret key stays server-side)
      const backendOrder = await createRazorpayBackendOrder({
        amount: bill.grandTotal,
        receipt: orderId,
        notes: { studentId: user.studentId || "", department: user.department || "" },
      });

      // Step 2: Open Razorpay modal
      openRazorpayPayment({
        amount: bill.grandTotal,
        orderId: backendOrder.orderId,
        description: `SmartBite Order ${orderId}`,
        prefill: {
          name: user.fullName || "Student",
          email: user.email || "student@campus.edu",
          contact: user.phone || "9999999999",
        },
        onSuccess: async ({ paymentId, orderId: rzpOrderId, signature }) => {
          try {
            // Step 3: Verify signature on backend — NEVER mark PAID without this
            const { verified, demoMode } = await verifyRazorpayPaymentBackend({
              razorpayOrderId: rzpOrderId,
              razorpayPaymentId: paymentId,
              razorpaySignature: signature,
            });

            if (!verified) {
              setError("Payment verification failed. Please contact support.");
              releasePaymentLock();
              setProcessing(false);
              return;
            }

            // Step 4: Save order as PAID only after verification
            const savedOrder = await saveOnlinePaymentOrder({
              orderId,
              pickupToken,
              student: user,
              items: cartItems,
              bill,
              razorpayPaymentId: paymentId,
              razorpayOrderId: rzpOrderId,
              razorpaySignature: signature,
              appliedCoupon: appliedCouponRaw || null,
              orderType,
            });

            if (demoMode) {
              savedOrder._demoNote = "Demo mode – signature not verified server-side";
            }

            releasePaymentLock();
            clearCart();
            sessionStorage.removeItem("smartbite_applied_coupon");
            sessionStorage.removeItem("smartbite_discount_amount");
            setCompletedOrder(savedOrder);
          } catch (saveErr) {
            console.error("Order save error:", saveErr);
            setError("Payment received but order save failed. Contact canteen staff.");
            releasePaymentLock();
            setProcessing(false);
          }
        },
        onFailure: (err) => {
          if (err.message?.includes("cancelled")) {
            setError("Payment cancelled. Your cart is intact.");
          } else {
            setError(err.message || "Payment failed. Please try again.");
          }
          releasePaymentLock();
          setProcessing(false);
        },
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      releasePaymentLock();
      setProcessing(false);
    }
  }, [user, isEmpty, idempotencyKey, bill, cartItems, orderType, appliedCouponRaw, clearCart]);

  // ── Cash at Canteen Handler ───────────────────────────────────────────────────
  const handleCashPayment = useCallback(async () => {
    if (!user) {
      setError("Please log in to place an order.");
      return;
    }
    if (isEmpty) {
      setError("Your cart is empty.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const orderId = generateOrderId();
      const pickupToken = generatePickupToken();

      const savedOrder = await savePendingCashOrder({
        orderId,
        pickupToken,
        student: user,
        items: cartItems,
        bill,
        appliedCoupon: appliedCouponRaw || null,
        orderType,
      });

      clearCart();
      sessionStorage.removeItem("smartbite_applied_coupon");
      sessionStorage.removeItem("smartbite_discount_amount");
      setCompletedOrder(savedOrder);
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [user, isEmpty, bill, cartItems, orderType, appliedCouponRaw, clearCart]);

  // ── Confirm & Pay ─────────────────────────────────────────────────────────────
  const handleConfirmPayment = () => {
    if (paymentMethod === "online") {
      handleOnlinePayment();
    } else {
      handleCashPayment();
    }
  };

  // ── Empty Cart State ──────────────────────────────────────────────────────────
  if (isEmpty && !completedOrder) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <ShoppingBag className="w-9 h-9 text-emerald-400" />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-1">Your cart is empty</h2>
        <p className="text-slate-500 text-sm mb-6">Add some delicious food before checking out.</p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 text-white font-bold text-sm hover:bg-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Menu
        </Link>
      </div>
    );
  }

  // ── Receipt Modal (shown after successful order) ───────────────────────────────
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        {/* Success Banner */}
        <div className="w-full max-w-lg mb-6 rounded-2xl bg-emerald-700 text-white p-6 text-center shadow-xl shadow-emerald-900/20">
          <CheckCircle2 className="w-14 h-14 mx-auto mb-3 animate-bounce" />
          <h2 className="text-2xl font-black mb-1">
            {completedOrder.paymentMethod === "cash"
              ? "Order Placed Successfully!"
              : "Payment Successful!"}
          </h2>
          <p className="text-emerald-200 text-sm">
            {completedOrder.paymentMethod === "cash"
              ? "Show your token at the counter & pay when collecting."
              : "Your order is confirmed and being prepared."}
          </p>

          {/* Pickup Token */}
          <div className="mt-4 bg-white/10 rounded-xl p-4 inline-block">
            <p className="text-xs text-emerald-200 font-bold uppercase tracking-wider mb-1">
              Pickup Token
            </p>
            <p className="text-4xl font-black tracking-widest text-orange-300">
              {completedOrder.pickupToken}
            </p>
            <p className="text-xs text-emerald-200 mt-1">Show at Counter #{" "}
              {completedOrder.paymentMethod === "cash" ? "to pay & collect" : "to collect"}
            </p>
          </div>
        </div>

        {/* Digital Receipt */}
        <div className="w-full max-w-lg">
          <DigitalReceipt order={completedOrder} />
        </div>

        <div className="mt-6 flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => navigate("/orders")}
            className="px-5 py-3 rounded-xl bg-emerald-700 text-white font-bold text-sm hover:bg-emerald-800 transition-colors"
          >
            View My Orders
          </button>
          <Link
            to="/menu"
            className="px-5 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:border-emerald-300 transition-colors"
          >
            Order More Food
          </Link>
        </div>
      </div>
    );
  }

  // ── Main Checkout Layout ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/cart" className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-black text-lg text-slate-900">Checkout</h1>
            <p className="text-xs text-slate-500">
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} · {formatCurrency(bill.grandTotal)} to pay
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── LEFT: Payment Options + Student Details ── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Student Info Card */}
          {user && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-black text-sm text-slate-500 uppercase tracking-wider mb-4">
                Ordering As
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</p>
                    <p className="text-sm font-bold text-slate-800">{user.fullName || "Student"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Hash className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student ID</p>
                    <p className="text-sm font-bold text-slate-800">{user.studentId || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</p>
                    <p className="text-sm font-bold text-slate-800">{user.department || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guest reminder */}
          {!user && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-amber-800 text-sm">Login required</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  You need to{" "}
                  <Link to="/login" className="underline font-bold">
                    sign in
                  </Link>{" "}
                  to complete your order.
                </p>
              </div>
            </div>
          )}

          {/* Order Type Selector */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-black text-sm text-slate-500 uppercase tracking-wider mb-3">
              Order Type
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "dinein", label: "Dine-In", desc: "Eat at the canteen" },
                { id: "takeaway", label: "Takeaway", desc: "Pack & carry" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setOrderType(opt.id)}
                  className={`rounded-xl border-2 p-3 text-left transition-all cursor-pointer ${
                    orderType === opt.id
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-emerald-200"
                  }`}
                >
                  <p className={`font-bold text-sm ${orderType === opt.id ? "text-emerald-800" : "text-slate-700"}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-black text-sm text-slate-500 uppercase tracking-wider mb-4">
              Payment Method
            </h2>
            <div className="space-y-3">

              {/* Option 1: Online Payment (Razorpay) */}
              <PaymentMethodCard
                id="online"
                selected={paymentMethod === "online"}
                onSelect={setPaymentMethod}
                icon={CreditCard}
                title="Pay Online"
                subtitle="UPI · Cards · Net Banking · Wallets"
                badge="Instant Confirmation"
                badgeColor="bg-emerald-100 text-emerald-800"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {["UPI", "Visa", "Mastercard", "RuPay", "Paytm", "GPay"].map((method) => (
                      <span
                        key={method}
                        className="text-[10px] font-bold px-2 py-0.5 bg-white border border-emerald-200 rounded-md text-emerald-700"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Secured by Razorpay · 256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Payment verified server-side before order confirmation</span>
                  </div>
                </div>
              </PaymentMethodCard>

              {/* Option 2: Cash at Canteen */}
              <PaymentMethodCard
                id="cash"
                selected={paymentMethod === "cash"}
                onSelect={setPaymentMethod}
                icon={Banknote}
                title="Cash at Canteen"
                subtitle="Pay directly at the counter when you collect"
                badge="Pay at Counter"
                badgeColor="bg-orange-100 text-orange-700"
              >
                <div className="space-y-2">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-orange-800 mb-1">How it works:</p>
                    <ol className="text-xs text-orange-700 space-y-1 list-decimal list-inside">
                      <li>Place order → get a unique pickup token</li>
                      <li>Go to <strong>Counter #1</strong> with your token</li>
                      <li>Show token, pay cash, collect food</li>
                      <li>Staff marks payment confirmed</li>
                    </ol>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Order placed instantly · payment collected at counter</span>
                  </div>
                </div>
              </PaymentMethodCard>

            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Items Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-20">
            <h2 className="font-black text-sm text-slate-500 uppercase tracking-wider mb-4">
              Order Summary
            </h2>

            {/* Line Items */}
            <div className="space-y-2 mb-4 max-h-52 overflow-y-auto pr-1">
              {bill.lineItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md flex-shrink-0">
                      ×{item.quantity}
                    </span>
                    <span className="text-sm text-slate-700 font-medium truncate">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800 flex-shrink-0">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Breakdown */}
            <div className="border-t border-slate-100 pt-3 space-y-0.5">
              <SummaryRow label="Subtotal" value={formatCurrency(bill.subtotal)} />

              {bill.taxAmount > 0 && bill.taxDetails && (
                <SummaryRow
                  label={`${bill.taxDetails.name} (${bill.taxDetails.rate}%)`}
                  value={formatCurrency(bill.taxAmount)}
                />
              )}

              {bill.packagingCharge > 0 && (
                <SummaryRow
                  label="Takeaway Packaging"
                  value={formatCurrency(bill.packagingCharge)}
                />
              )}

              <SummaryRow
                label="Campus Express Pickup"
                value="FREE"
                green
              />

              {bill.discountAmount > 0 && (
                <SummaryRow
                  label={`Discount${appliedCouponRaw ? ` (${appliedCouponRaw})` : ""}`}
                  value={`-${formatCurrency(bill.discountAmount)}`}
                  red
                />
              )}

              <div className="border-t border-slate-200 mt-2 pt-3 flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">Grand Total</span>
                <span className="text-xl font-black text-emerald-700">
                  {formatCurrency(bill.grandTotal)}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 pt-1 text-center">
                Taxes &amp; charges applied per campus canteen policy only.
              </p>
            </div>

            {/* CTA Button */}
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={processing || !user}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                  paymentMethod === "online"
                    ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/30"
                    : "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30"
                }`}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing…</span>
                  </>
                ) : paymentMethod === "online" ? (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay {formatCurrency(bill.grandTotal)} Online</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Banknote className="w-4 h-4" />
                    <span>Place Order · Pay at Counter</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <Link
                to="/cart"
                className="w-full py-3 px-6 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:border-emerald-300 hover:text-emerald-700 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Edit Cart
              </Link>
            </div>

            {/* Test Mode Banner */}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                ⚡ Razorpay Test Mode
              </p>
              <p className="text-[10px] text-amber-600 mt-0.5">
                Use card 4111 1111 1111 1111, any future expiry &amp; CVV for demo
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;

