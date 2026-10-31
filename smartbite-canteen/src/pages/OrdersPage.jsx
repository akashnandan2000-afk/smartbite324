import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  QrCode, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles,
  MapPin,
  Receipt,
  Printer,
  Download
} from "lucide-react";
import { useOrders } from "../hooks/useOrders";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { DigitalReceipt } from "../components/DigitalReceipt";
import { toast } from "react-toastify";

export const OrdersPage = () => {
  const { orders } = useOrders();
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  const getStatusStep = (status) => {
    switch (status) {
      case "Order Received":
        return 1;
      case "Preparing":
        return 2;
      case "Ready for Pickup":
        return 3;
      case "Completed":
        return 4;
      default:
        return 2;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Ready for Pickup":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Preparing":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Completed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-orange-100 text-orange-800 border-orange-300";
    }
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm">
          <QrCode className="w-10 h-10 stroke-[1.75]" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">No Active Tokens</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          You haven't placed any canteen orders yet. Place an order to generate your scannable pickup QR code and digital receipt.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Digital Receipt Modal if triggered */}
      {selectedReceiptOrder && (
        <DigitalReceipt
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}

      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs mb-2">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>Instant Pickup Desk &bull; Digital Invoicing Active</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          My Canteen Orders &amp; Receipts
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Flash your pickup token at Counter #1 or print/download digital receipts for campus expense reimbursement.
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const currentStep = getStatusStep(order.status);

          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-900 text-emerald-200 flex items-center justify-center font-black text-xs">
                    SB
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-lg">
                        {order.id}
                      </span>
                      <span
                        className={`text-xs font-extrabold px-3 py-0.5 rounded-full border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDateTime(order.createdAt)}</span>
                      <span>&bull;</span>
                      <span className="text-emerald-700 font-semibold">{order.paymentStatus || "PAID"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="text-left sm:text-right mr-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Grand Total
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  {/* Digital Receipt Trigger Button */}
                  <button
                    onClick={() => setSelectedReceiptOrder(order)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>

              {/* Progress Stepper Bar */}
              <div className="px-6 py-5 bg-white border-b border-slate-100">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className={`space-y-1 ${currentStep >= 1 ? "text-emerald-800" : "text-slate-400"}`}>
                    <div className={`h-2 rounded-full ${currentStep >= 1 ? "bg-emerald-600" : "bg-slate-200"}`} />
                    <span className="text-[10px] sm:text-xs font-bold block">1. Received</span>
                  </div>
                  <div className={`space-y-1 ${currentStep >= 2 ? "text-emerald-800" : "text-slate-400"}`}>
                    <div className={`h-2 rounded-full ${currentStep >= 2 ? "bg-amber-500" : "bg-slate-200"}`} />
                    <span className="text-[10px] sm:text-xs font-bold block">2. In Kitchen</span>
                  </div>
                  <div className={`space-y-1 ${currentStep >= 3 ? "text-emerald-800" : "text-slate-400"}`}>
                    <div className={`h-2 rounded-full ${currentStep >= 3 ? "bg-emerald-600" : "bg-slate-200"}`} />
                    <span className="text-[10px] sm:text-xs font-bold block">3. Ready</span>
                  </div>
                  <div className={`space-y-1 ${currentStep >= 4 ? "text-emerald-800" : "text-slate-400"}`}>
                    <div className={`h-2 rounded-full ${currentStep >= 4 ? "bg-emerald-800" : "bg-slate-200"}`} />
                    <span className="text-[10px] sm:text-xs font-bold block">4. Collected</span>
                  </div>
                </div>
              </div>

              {/* Card Body: Items on Left, QR on Right */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Items List with itemized formula */}
                <div className="md:col-span-7 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Itemized Billing Math
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-slate-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-slate-800">{item.name}</span>
                        </div>
                        <span className="font-semibold text-slate-900 font-mono">
                          {item.quantity} &times; ₹{item.price} = {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Automatic Subtotal display */}
                  <div className="pt-2 text-xs flex justify-between font-bold text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal || order.total)}</span>
                  </div>

                  {order.cookingNotes && (
                    <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-100 text-xs text-orange-900">
                      <strong>Cooking Note:</strong> {order.cookingNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
                      <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>Counter #1 Express Pickup</span>
                    </div>

                    <button
                      onClick={() => setSelectedReceiptOrder(order)}
                      className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Tax Invoice</span>
                    </button>
                  </div>
                </div>

                {/* QR Code Scannable Card */}
                <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-2xl p-5 border border-slate-200/90 flex flex-col items-center justify-center text-center">
                  <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200/80">
                    <QRCodeSVG
                      value={JSON.stringify({
                        orderId: order.id,
                        pickupToken: order.pickupCode || order.id,
                        total: order.total,
                        paid: true
                      })}
                      size={135}
                      level="H"
                      fgColor="#022c22"
                    />
                  </div>

                  <div className="mt-3.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                      Pickup Token
                    </span>
                    <span className="text-xl font-black text-orange-600 tracking-wider">
                      {order.pickupCode || order.id}
                    </span>
                    <span className="text-[10px] text-emerald-800 block mt-0.5 font-bold">
                      Scan at Canteen Counter
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
