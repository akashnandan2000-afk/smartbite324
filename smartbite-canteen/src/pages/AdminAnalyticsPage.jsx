import { useState, useEffect, useCallback, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  ChefHat,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  QrCode,
  Flame,
  ArrowUpRight,
  Banknote,
  RefreshCw
} from "lucide-react";
import { formatCurrency } from "../utils/formatters";
import { toast } from "react-toastify";
import { confirmCashPayment } from "../services/paymentService";

// ─── Cash Confirmation Panel ────────────────────────────────────────────────────
const CashConfirmationPanel = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [confirming, setConfirming] = useState(null);

  const loadPendingOrders = useCallback(() => {
    try {
      const all = JSON.parse(localStorage.getItem("smartbite_orders") || "[]");
      const pending = all.filter(
        (o) => o.paymentMethod === "cash" && o.paymentStatus === "PENDING"
      );
      setPendingOrders(pending);
    } catch {
      setPendingOrders([]);
    }
  }, []);

  useEffect(() => {
    loadPendingOrders();
    const interval = setInterval(loadPendingOrders, 5000);
    return () => clearInterval(interval);
  }, [loadPendingOrders]);

  const handleConfirm = async (orderId) => {
    setConfirming(orderId);
    try {
      await confirmCashPayment(orderId);
      toast.success(`Cash payment confirmed for ${orderId}`);
      loadPendingOrders();
    } catch (err) {
      toast.error(`Failed to confirm: ${err.message}`);
    } finally {
      setConfirming(null);
    }
  };

  if (pendingOrders.length === 0) return null;

  return (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-6 sm:p-8 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg">Cash Payment Confirmations</h3>
            <p className="text-xs text-slate-500">
              {pendingOrders.length} order{pendingOrders.length !== 1 ? "s" : ""} awaiting cash collection
            </p>
          </div>
        </div>
        <button
          onClick={loadPendingOrders}
          className="flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingOrders.map((order) => (
          <div
            key={order.orderId}
            className="bg-white border border-orange-200 rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700">{order.orderId}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase">
                Pending
              </span>
            </div>
            <div className="text-2xl font-black text-orange-600 tracking-widest text-center py-1">
              {order.pickupToken}
            </div>
            <div className="text-xs text-slate-600 space-y-0.5">
              <p className="font-bold">{order.student?.fullName || "Student"}</p>
              <p className="text-slate-500">{order.student?.studentId}</p>
              <p className="text-slate-500">{order.items?.length || 0} item(s)</p>
            </div>
            <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
              <span className="text-sm font-black text-slate-900">
                {formatCurrency(order.grandTotal)}
              </span>
              <button
                onClick={() => handleConfirm(order.orderId)}
                disabled={confirming === order.orderId}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black cursor-pointer disabled:opacity-60 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {confirming === order.orderId ? "Confirming…" : "Confirm Cash"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HOURLY_TRAFFIC_DATA = [
  { hour: "8 AM", orders: 18, revenue: 1260 },
  { hour: "9 AM", orders: 35, revenue: 2450 },
  { hour: "10 AM", orders: 24, revenue: 1680 },
  { hour: "11 AM", orders: 40, revenue: 2800 },
  { hour: "12 PM", orders: 95, revenue: 6650 },
  { hour: "1 PM", orders: 120, revenue: 8400 },
  { hour: "2 PM", orders: 65, revenue: 4550 },
  { hour: "4 PM", orders: 85, revenue: 5950 },
  { hour: "6 PM", orders: 45, revenue: 3150 }
];

const CATEGORY_SHARE = [
  { name: "South Indian & Breakfast", value: 32, color: "#065f46" },
  { name: "Burgers & Sandwiches", value: 26, color: "#f97316" },
  { name: "Shakes & Brews", value: 18, color: "#10b981" },
  { name: "Rice & Thalis", value: 14, color: "#0284c7" },
  { name: "Asian & Snacks", value: 10, color: "#8b5cf6" }
];

// QR Code Section Component
const QRCodeSection = ({ url }) => {
  const canvasRef = useRef(null);
  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "smartbite-qr.png";
    link.click();
  };
  return (
    <div className="mt-8 p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm text-center">
      <h2 className="text-xl font-black text-slate-900 mb-4">Student QR Code</h2>
      <p className="text-sm text-slate-600 mb-4">Scan to open the SmartBite portal.</p>
      <div ref={canvasRef} className="inline-block mx-auto mb-4">
        <QRCodeCanvas value={url} size={200} level="H" />
      </div>
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
      >
        Download QR Code
      </button>
    </div>
  );
};

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  // Live Kitchen Display State (KDS)
  const [kitchenOrders, setKitchenOrders] = useState([
    {
      id: "ORD-9421",
      token: "BITE-9421",
      items: "2x Masala Dosa, 1x Cold Coffee",
      status: "Ready",
      elapsed: "5m ago",
      station: "Counter 1",
      customer: "Rohan S."
    },
    {
      id: "ORD-9422",
      token: "BITE-9422",
      items: "1x Tandoori Paneer Burger, 1x Peri Peri Fries",
      status: "Cooking",
      elapsed: "3m ago",
      station: "Counter 2",
      customer: "Ananya M."
    },
    {
      id: "ORD-9423",
      token: "BITE-9423",
      items: "1x Hakka Noodles, 1x Steamed Momos",
      status: "Incoming",
      elapsed: "1m ago",
      station: "Counter 1",
      customer: "Varun K."
    }
  ]);

  const handleUpdateStatus = (id, newStatus) => {
    setKitchenOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
    toast.info(`Order ${id} status updated to: ${newStatus}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Canteen Operations &bull; Staff Command Center</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">
            Kitchen Live Hub &amp; Rush Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time telemetry for queue forecasting, peak break rushes, and kitchen ticket dispatch.
          </p>
        </div>

        {/* Live sync badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-2xl bg-emerald-900 text-white text-xs font-bold shadow-md shadow-emerald-950/20">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Realtime Firestore Live Sync</span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Today's Gross Sales
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">₹36,890</div>
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold mt-2">
            <ArrowUpRight className="w-4 h-4" />
            <span>+18.4% vs last Friday rush</span>
          </div>
        </div>

        {/* Orders Served */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Dishes Fulfilled
            </span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <ChefHat className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">428</div>
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>99.2% zero-delay accuracy</span>
          </div>
        </div>

        {/* Avg Prep Time */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Avg Prep Time
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">5.8 mins</div>
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold mt-2">
            <span>2.4 mins faster than manual counter</span>
          </div>
        </div>

        {/* Active Counter Status */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Counter Stations
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">3 / 3 Active</div>
          <div className="text-xs text-slate-500 font-semibold mt-2">
            South, Burgers &amp; Shakes online
          </div>
        </div>
      </div>

      {/* KITCHEN DISPLAY SYSTEM (KDS) - Interactive Ticket Dispatch */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Live Kitchen Order Tickets</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Active Prep Queue (Staff Control)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Simulate order preparation status transitions live
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {kitchenOrders.map((order) => (
            <div
              key={order.id}
              className={`p-5 rounded-2xl border transition-all ${order.status === "Ready"
                ? "bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/10"
                : order.status === "Cooking"
                  ? "bg-amber-50/60 border-amber-300"
                  : "bg-slate-50 border-slate-200"
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-900">{order.id}</span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${order.status === "Ready"
                    ? "bg-emerald-600 text-white"
                    : order.status === "Cooking"
                      ? "bg-amber-500 text-white"
                      : "bg-slate-200 text-slate-700"
                    }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="font-black text-orange-600 text-sm tracking-wide">
                {order.token}
              </div>

              <p className="text-xs font-bold text-slate-800 my-2 leading-relaxed">
                {order.items}
              </p>

              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 mb-3">
                <span>{order.customer}</span>
                <span>{order.station}</span>
              </div>

              {/* Status Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {order.status !== "Ready" ? (
                  <button
                    onClick={() => handleUpdateStatus(order.id, "Ready")}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Mark Ready
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(order.id, "Completed")}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Mark Picked
                  </button>
                )}

                {order.status === "Incoming" && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, "Cooking")}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Start Cook
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PENDING CASH ORDERS — Staff Confirmation Panel */}
      <CashConfirmationPanel />

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Hourly Rush Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-lg">
                Hourly Break Rush Traffic
              </h3>
              <p className="text-xs text-slate-500">
                Peak canteen orders surge at 12 PM - 1:30 PM (Lunch Interval)
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
              Lunch Peak: 1 PM
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_TRAFFIC_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#022c22",
                    borderRadius: "12px",
                    border: "none",
                    color: "#ffffff"
                  }}
                  itemStyle={{ color: "#34d399" }}
                />
                <Bar dataKey="orders" fill="#065f46" radius={[8, 8, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie Chart */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-black text-slate-900 text-lg">
              Sales by Food Category
            </h3>
            <p className="text-xs text-slate-500">
              South Indian dosas and fast burgers lead student preferences
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_SHARE}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={52}
                  paddingAngle={4}
                >
                  {CATEGORY_SHARE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-2 text-xs">
            {CATEGORY_SHARE.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-md"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-slate-700">{cat.name}</span>
                </div>
                <span className="font-black text-slate-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
