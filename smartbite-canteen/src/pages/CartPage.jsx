import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  ShoppingBag, 
  Tag, 
  CheckCircle2, 
  Clock, 
  Utensils, 
  Info,
  Sparkles,
  AlertCircle,
  Coffee,
  Receipt,
  Settings
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useOrders } from "../hooks/useOrders";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatters";
import { openRazorpayPayment } from "../services/razorpay";
import { calculateBill, getBillingConfig, updateBillingConfig } from "../services/billingConfig";
import { DigitalReceipt } from "../components/DigitalReceipt";
import { toast } from "react-toastify";

// Quick canteen add-on snacks / beverages for 1-click cart addition
const QUICK_ADDONS = [
  { id: "item-7", name: "Tea", price: 10, category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80" },
  { id: "item-8", name: "Coffee", price: 15, category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80" },
  { id: "item-3", name: "Porotta", price: 12, category: "Breakfast", isVeg: true, image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=300&q=80" },
  { id: "item-9", name: "Fresh Juice", price: 30, category: "Beverages", isVeg: true, image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=300&q=80" }
];

export const CartPage = () => {
  const { 
    items, 
    addItem, 
    removeItem, 
    increaseQuantity, 
    decreaseQuantity, 
    clearCart, 
    subtotal, 
    totalCount 
  } = useCart();
  
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [orderType, setOrderType] = useState("takeaway"); // takeaway or dinein
  const [cookingNotes, setCookingNotes] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [newlyCreatedOrder, setNewlyCreatedOrder] = useState(null);

  // Canteen Billing Configuration (Strict rule: NEVER apply invented tax rates)
  const billingConfig = useMemo(() => getBillingConfig(), []);

  // Automatic live bill calculation strictly using canteen configuration
  const bill = useMemo(() => {
    return calculateBill({
      items,
      orderType,
      discount: discountAmount,
      configOverride: billingConfig
    });
  }, [items, orderType, discountAmount, billingConfig]);

  // Handle coupon application
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();

    if (code === "HACKATHON50" || code === "SMARTBITE50") {
      if (bill.subtotal < 80) {
        toast.warning("Subtotal must be at least ₹80 for this coupon.");
        return;
      }
      setDiscountAmount(50);
      setAppliedCoupon(code);
      toast.success(`Coupon ${code} applied! ₹50 OFF saved.`);
    } else if (code === "CAMPUS20") {
      const disc = Math.round(bill.subtotal * 0.2);
      setDiscountAmount(disc);
      setAppliedCoupon(code);
      toast.success(`Coupon ${code} applied! 20% discount applied.`);
    } else {
      toast.error("Invalid coupon code. Try 'HACKATHON50' or 'CAMPUS20'");
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountAmount(0);
    setAppliedCoupon("");
    setCouponCode("");
    toast.info("Coupon removed.");
  };

  // Clear Cart Confirmation
  const handleClearCart = () => {
    clearCart();
    setDiscountAmount(0);
    setAppliedCoupon("");
    setShowClearConfirm(false);
    toast.info("Your food tray has been cleared.");
  };

  // Checkout Execution — save coupon state and navigate to dedicated CheckoutPage
  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    // Persist coupon/discount so CheckoutPage can read it
    if (appliedCoupon) {
      sessionStorage.setItem("smartbite_applied_coupon", appliedCoupon);
      sessionStorage.setItem("smartbite_discount_amount", String(discountAmount));
    } else {
      sessionStorage.removeItem("smartbite_applied_coupon");
      sessionStorage.removeItem("smartbite_discount_amount");
    }
    navigate("/checkout");
  };

  // Empty Cart State
  if (items.length === 0 && !newlyCreatedOrder) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4">
        <div className="w-24 h-24 rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm">
          <ShoppingBag className="w-12 h-12 stroke-[1.6]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          Your Food Tray is Empty
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          Looks like you haven't selected any canteen dishes yet. Explore today's freshly prepared specials and build your meal.
        </p>
        <div className="pt-6">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-sm shadow-xl shadow-orange-600/30 transition-all cursor-pointer"
          >
            <Utensils className="w-4 h-4" />
            <span>Continue Shopping &bull; Browse Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Digital Receipt Modal if just placed order */}
      {newlyCreatedOrder && (
        <DigitalReceipt
          order={newlyCreatedOrder}
          onClose={() => {
            setNewlyCreatedOrder(null);
            navigate("/orders");
          }}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Automatic Canteen Billing System</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">
            Review Your Canteen Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {totalCount} item{totalCount > 1 ? "s" : ""} selected &bull; Subtotal and charges calculate automatically without arbitrary taxes.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Clear Entire Food Tray?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will remove all {totalCount} items from your cart. You will need to re-add your meals.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearCart}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Cart Items on Left, Automatic Bill on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Items List & Quick Addons */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Pickup Style Option */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                Select Service Mode
              </span>
              <p className="text-[11px] text-slate-500">
                Packaging fees apply only if configured by canteen.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOrderType("takeaway")}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  orderType === "takeaway"
                    ? "bg-emerald-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Express Takeaway {billingConfig.enablePackagingFee && billingConfig.takeawayPackagingFee > 0 ? `(+₹${billingConfig.takeawayPackagingFee})` : "(₹0)"}
              </button>

              <button
                type="button"
                onClick={() => setOrderType("dinein")}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  orderType === "dinein"
                    ? "bg-emerald-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Dine-In Canteen Tray (₹0)
              </button>
            </div>
          </div>

          {/* Cart Items List with Itemized Math */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden divide-y divide-slate-100">
            {bill.lineItems.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex items-center gap-4">
                
                {/* Food Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-slate-200"
                />

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    {/* Veg / Non-Veg Indicator */}
                    <div className="w-3.5 h-3.5 rounded-xs border border-slate-300 flex items-center justify-center shrink-0">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-rose-600"}`} />
                    </div>

                    <h3 className="font-black text-slate-900 text-sm sm:text-base truncate">
                      {item.name}
                    </h3>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {item.category}
                  </span>

                  {/* Itemized pricing display: e.g. Chicken Biriyani x 1 = ₹100 */}
                  <p className="text-xs font-mono font-bold text-slate-600">
                    {item.name} &times; {item.quantity} = <strong className="text-orange-600">{formatCurrency(item.total)}</strong>
                  </p>
                </div>

                {/* Quantity Controls (Updates Bill Immediately) */}
                <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => decreaseQuantity(item.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white text-slate-700 active:scale-90 transition-all cursor-pointer"
                    title="Decrease Quantity"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  
                  <span className="w-7 text-center font-black text-xs text-slate-900">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => increaseQuantity(item.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-600 hover:bg-orange-500 text-white active:scale-90 transition-all cursor-pointer shadow-xs"
                    title="Increase Quantity"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Item Total Amount & Delete */}
                <div className="text-right shrink-0">
                  <div className="font-black text-slate-900 text-sm sm:text-base">
                    {formatCurrency(item.total)}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeItem(item.id);
                      toast.info(`Removed ${item.name} from tray.`);
                    }}
                    className="text-rose-500 hover:text-rose-700 text-xs mt-1 inline-flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Quick Canteen Add-ons Bar */}
          <div className="bg-emerald-50/60 p-5 rounded-3xl border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-orange-500" />
                Frequently Added Campus Sides
              </span>
              <span className="text-[10px] text-emerald-800 font-bold">1-Click Fast Add</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QUICK_ADDONS.map((addon) => (
                <div
                  key={addon.id}
                  className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <h5 className="font-black text-slate-800 text-xs truncate">{addon.name}</h5>
                    <span className="text-[11px] font-bold text-orange-600">{formatCurrency(addon.price)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addItem(addon);
                      toast.success(`Added ${addon.name}!`, { autoClose: 1000 });
                    }}
                    className="w-7 h-7 rounded-xl bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center shrink-0 cursor-pointer active:scale-90 transition-transform shadow-xs"
                    title={`Add ${addon.name}`}
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Special Cooking Notes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
              Special Kitchen Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Extra spicy, pack chutney separately, no sugar in tea..."
              value={cookingNotes}
              onChange={(e) => setCookingNotes(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

        </div>

        {/* Right Column: Detailed Bill Breakdown & Automatic Billing */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Promo Coupon Box */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-orange-600" />
                Apply Campus Coupon
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Try: HACKATHON50
              </span>
            </div>

            {appliedCoupon ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-black text-emerald-950 block">
                      {appliedCoupon} Active
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      You saved {formatCurrency(discountAmount)} on this tray!
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Promo Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 uppercase font-black focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white font-black text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Automatic Bill Breakdown (Updates Immediately) */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-800" />
                <span>Automatic Billing Summary</span>
              </h3>
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {totalCount} item{totalCount > 1 ? "s" : ""}
              </span>
            </div>

            {/* Student Preview Info */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Student:</span>
                <span className="font-bold text-slate-800">{user?.fullName || "Campus Student"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Student ID:</span>
                <span className="font-mono text-slate-700">{user?.studentId || "2024CS104"}</span>
              </div>
            </div>

            {/* Applicable Charges Breakdown */}
            <div className="space-y-3 text-xs text-slate-600 border-b border-slate-100 pb-4">
              
              {/* Automatically calculated Subtotal */}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Subtotal</span>
                <span className="font-black text-slate-900 text-sm">{formatCurrency(bill.subtotal)}</span>
              </div>

              {/* Applicable Tax: Only if configured by canteen, NEVER invented */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-slate-500">
                  <span>Applicable Canteen Tax</span>
                  {bill.taxDetails ? (
                    <span className="text-[10px] font-bold text-emerald-800">
                      ({bill.taxDetails.name} {bill.taxDetails.rate}%)
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold">
                      (0% &bull; No tax configured by canteen)
                    </span>
                  )}
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(bill.taxAmount)}</span>
              </div>

              {/* Additional Packaging Fee (Only if configured and order is takeaway) */}
              <div className="flex justify-between items-center text-slate-500">
                <span>Takeaway Packaging Charge</span>
                <span className="font-bold text-slate-900">
                  {bill.packagingCharge > 0 ? formatCurrency(bill.packagingCharge) : "₹0 (Free)"}
                </span>
              </div>

              {/* Campus Express Platform Fee */}
              <div className="flex justify-between items-center text-slate-500">
                <span>Campus Express Pickup</span>
                <span className="font-bold text-emerald-700">FREE</span>
              </div>

              {/* Promo Discount */}
              {bill.discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-black">
                  <span>Campus Discount ({appliedCoupon})</span>
                  <span>-{formatCurrency(bill.discountAmount)}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Grand Total
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {formatCurrency(bill.grandTotal)}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                Instant Updated
              </span>
            </div>

            {/* Proceed to Checkout Action */}
            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={processing}
              className="w-full py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-black text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{processing ? "Redirecting..." : "Proceed to Checkout"}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            {/* Continue Shopping Secondary Link */}
            <div className="pt-2 text-center">
              <Link
                to="/menu"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue Shopping &bull; Add More Dishes</span>
              </Link>
            </div>

            {/* Canteen Policy Note */}
            <div className="pt-2 border-t border-slate-100 text-slate-400 text-[10px] text-center leading-relaxed">
              Taxes &amp; additional charges apply strictly per campus canteen policy. No arbitrary rates applied.
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
