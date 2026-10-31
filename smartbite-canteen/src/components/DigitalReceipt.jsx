import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  Receipt,
  GraduationCap
} from "lucide-react";
import { formatCurrency, formatDateTime } from "../utils/formatters";

export const DigitalReceipt = ({ order, onClose }) => {
  const receiptRef = useRef(null);

  if (!order) return null;

  // Extract order details
  const orderId = order.id || "ORD-0000";
  const pickupToken = order.pickupCode || orderId;
  const createdAt = order.createdAt || new Date().toISOString();
  const student = order.studentDetails || {
    fullName: "Campus Student",
    studentId: "2024CS104",
    collegeEmail: "student@campus.edu",
    department: "Computer Science"
  };

  const lineItems = order.items || [];
  const subtotal = order.subtotal ?? lineItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxAmount = order.taxAmount ?? 0;
  const taxDetails = order.taxDetails ?? null;
  const packagingFee = order.packagingFee ?? 0;
  const discountAmount = order.discountAmount ?? 0;
  const grandTotal = order.total ?? (subtotal + taxAmount + packagingFee - discountAmount);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Download receipt function (.txt and html format)
  const handleDownload = () => {
    const textReceipt = `
======================================================
               SMARTBITE CAMPUS CANTEEN
            Student Activity Center, Counter #1
======================================================
Order ID     : ${orderId}
Pickup Token : ${pickupToken}
Date & Time  : ${formatDateTime(createdAt)}
Status       : ${order.paymentStatus || "PAID"} (Razorpay Test Mode)
Payment ID   : ${order.razorpayPaymentId || "N/A"}
------------------------------------------------------
STUDENT DETAILS
------------------------------------------------------
Name         : ${student.fullName}
Student ID   : ${student.studentId}
Email        : ${student.collegeEmail}
Department   : ${student.department || "General"}
------------------------------------------------------
ITEMIZED FOOD ORDER
------------------------------------------------------
${lineItems
  .map(
    (item, idx) =>
      `${idx + 1}. ${item.name} (${item.category || "Food"})\n   ${item.quantity} x ₹${item.price} = ₹${item.quantity * item.price}`
  )
  .join("\n")}
------------------------------------------------------
Subtotal            : ₹${subtotal}
${taxAmount > 0 ? `${taxDetails?.name || "Configured Tax"} (${taxDetails?.rate || 0}%) : ₹${taxAmount}` : "Applicable Taxes    : ₹0 (No tax configured by canteen)"}
${packagingFee > 0 ? `Takeaway Packaging  : ₹${packagingFee}` : "Packaging Fee       : ₹0"}
${discountAmount > 0 ? `Promo Discount      : -₹${discountAmount}` : ""}
------------------------------------------------------
GRAND TOTAL         : ₹${grandTotal}
======================================================
Scan your digital QR token at the express pickup hatch.
Thank you for dining with SmartBite Canteen!
======================================================
`.trim();

    const blob = new Blob([textReceipt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SmartBite-Receipt-${orderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Actions Bar (Hidden on print) */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-800" />
            <span className="font-black text-slate-900 text-sm">Official Digital Receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs transition-colors cursor-pointer"
              title="Download Receipt"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors ml-1 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div ref={receiptRef} className="p-6 sm:p-8 space-y-6 text-slate-900 print:p-0">
          
          {/* Canteen Header */}
          <div className="text-center pb-6 border-b border-dashed border-slate-300 space-y-1.5">
            <div className="inline-flex items-center justify-center gap-1.5 mb-1">
              <span className="font-black text-2xl tracking-tight text-emerald-950">
                Smart<span className="text-orange-600">Bite</span>
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Canteen
              </span>
            </div>
            
            <p className="text-xs font-semibold text-slate-700">
              Campus Student Activity Center &bull; Counter #1 &amp; #2
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              FSSAI Lic No: FSSAI-CAMPUS-2024-9981 &bull; Zero-Queue System
            </p>
          </div>

          {/* Order ID & Token QR Block */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="sm:col-span-8 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Order ID:</span>
                <span className="font-black text-slate-900 font-mono text-sm">{orderId}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Pickup Token:</span>
                <span className="font-black text-orange-600 text-base">{pickupToken}</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDateTime(createdAt)}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{order.paymentStatus || "PAID"} &bull; Razorpay Test Mode</span>
              </div>
            </div>

            {/* Scannable Pickup QR Code */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-slate-200">
              <QRCodeSVG
                value={JSON.stringify({
                  orderId,
                  token: pickupToken,
                  total: grandTotal,
                  paid: true
                })}
                size={90}
                level="M"
              />
              <span className="text-[9px] font-black uppercase text-slate-400 mt-1">Scan At Counter</span>
            </div>
          </div>

          {/* Student Details Section */}
          <div className="space-y-2 pb-4 border-b border-dashed border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Student Information
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Student Name</span>
                <span className="font-bold text-slate-800">{student.fullName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Student ID</span>
                <span className="font-bold text-slate-800 font-mono">{student.studentId}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">College Email</span>
                <span className="font-medium text-slate-700 truncate block">{student.collegeEmail}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Department</span>
                <span className="font-medium text-slate-700 truncate block">{student.department || "General"}</span>
              </div>
            </div>
          </div>

          {/* Food Details Itemized Table */}
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Itemized Food Details
            </span>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="grid grid-cols-12 pb-2 font-black text-slate-400 text-[10px] uppercase">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Price</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              {lineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 py-2 items-center">
                  <div className="col-span-6 pr-2">
                    <span className="font-bold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] text-slate-400 block">{item.category}</span>
                  </div>
                  <span className="col-span-2 text-center font-bold text-slate-700">&times; {item.quantity}</span>
                  <span className="col-span-2 text-right text-slate-600">{formatCurrency(item.price)}</span>
                  <span className="col-span-2 text-right font-black text-slate-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Automatic Billing Breakdown */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            {/* Subtotal */}
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold text-slate-900 text-sm">{formatCurrency(subtotal)}</span>
            </div>

            {/* Applicable Taxes (ONLY if configured by canteen, never invented) */}
            <div className="flex justify-between items-center">
              <div className="text-slate-500">
                <span>Applicable Canteen Tax</span>
                {taxDetails ? (
                  <span className="text-[10px] text-emerald-800 ml-1">({taxDetails.name} {taxDetails.rate}%)</span>
                ) : (
                  <span className="text-[10px] text-slate-400 ml-1">(None configured)</span>
                )}
              </div>
              <span className="font-bold text-slate-800">{formatCurrency(taxAmount)}</span>
            </div>

            {/* Additional Charges (packaging only if takeaway and configured) */}
            <div className="flex justify-between items-center text-slate-500">
              <span>Takeaway Packaging Charge</span>
              <span className="font-bold text-slate-800">
                {packagingFee > 0 ? formatCurrency(packagingFee) : "₹0 (Free)"}
              </span>
            </div>

            {/* Promo Discount if applicable */}
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-700 font-bold">
                <span>Campus Discount Applied</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            {/* Grand Total */}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-black text-slate-900 text-sm uppercase">Grand Total</span>
              <span className="font-black text-xl text-slate-900">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Footer Receipt Note */}
          <div className="text-center pt-2 text-[10px] text-slate-400 space-y-1">
            <p>Please present this digital receipt or QR token at Counter #1 to collect food.</p>
            <p>SmartBite Canteen &copy; {new Date().getFullYear()} &bull; Computer Generated Tax Invoice</p>
          </div>

        </div>

        {/* Modal Bottom Close Button (Hidden on print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Digital Receipt</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer"
            >
              Close Receipt
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

