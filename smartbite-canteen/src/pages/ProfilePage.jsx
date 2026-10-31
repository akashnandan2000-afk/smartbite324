import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  IdCard, 
  Mail, 
  Building2, 
  GraduationCap, 
  LogOut, 
  ShoppingBag, 
  QrCode, 
  ShieldCheck, 
  Sparkles,
  Flame,
  Clock,
  ChevronRight,
  Edit3,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../hooks/useOrders";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { toast } from "react-toastify";

export const ProfilePage = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [prefDiet, setPrefDiet] = useState("pure-veg");
  const [phone, setPhone] = useState("9876543210");

  const totalSpent = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const activeOrdersCount = orders.filter((o) => o.status !== "Completed").length;

  const handleLogout = async () => {
    await logout();
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setIsEditing(false);
    toast.success("Dining preferences saved.");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Card: Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl border border-emerald-800/80 relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar Initials */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 border-2 border-emerald-400 text-white font-black text-2xl flex items-center justify-center shadow-lg">
              {user?.fullName
                ? user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "ST"}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {user?.fullName || "Student User"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-emerald-950 font-black text-[10px] uppercase tracking-wider">
                  {user?.role || "Student"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200/80 font-medium">
                {user?.department} &bull; {user?.yearOfStudy}
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-mono mt-1">
                <IdCard className="w-3.5 h-3.5 text-orange-400" />
                <span>ID: {user?.studentId}</span>
              </div>
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-rose-600/90 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Orders
            </span>
            <span className="text-2xl font-black text-slate-900">{orders.length}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <QrCode className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active QR Tokens
            </span>
            <span className="text-2xl font-black text-slate-900">{activeOrdersCount}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Meal Spend
            </span>
            <span className="text-2xl font-black text-slate-900">{formatCurrency(totalSpent)}</span>
          </div>
        </div>
      </div>

      {/* Detailed Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Official Student Record */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Official Campus Credentials
              </h3>
              <p className="text-xs text-slate-500">
                Verified enrollment data tied to your SmartBite token account.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 uppercase font-black text-[10px] block">
                Full Registered Name
              </span>
              <span className="text-sm font-bold text-slate-900 block">{user?.fullName}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 uppercase font-black text-[10px] block">
                Official Student ID
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono block">{user?.studentId}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 uppercase font-black text-[10px] block">
                College Email
              </span>
              <span className="text-sm font-bold text-slate-900 block">{user?.email || user?.collegeEmail}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 uppercase font-black text-[10px] block">
                Academic Department
              </span>
              <span className="text-sm font-bold text-slate-900 block">{user?.department}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 uppercase font-black text-[10px] block">
                Current Year of Study
              </span>
              <span className="text-sm font-bold text-slate-900 block">{user?.yearOfStudy}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 uppercase font-black text-[10px] block">
                Authorized Role
              </span>
              <span className="text-sm font-black text-emerald-800 uppercase block">
                {user?.role} (Standard Dining Clearance)
              </span>
            </div>
          </div>

          {/* Quick Nav to Active Orders */}
          <div className="pt-2">
            <Link
              to="/orders"
              className="w-full py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>View My Active QR Pickup Tokens ({activeOrdersCount})</span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-700" />
            </Link>
          </div>
        </div>

        {/* Right Column: Student Dining Preferences */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">
              Dining Preferences
            </h3>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
              Fast Order Setup
            </span>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                Dietary Habit
              </label>
              <select
                value={prefDiet}
                onChange={(e) => setPrefDiet(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="pure-veg">Pure Vegetarian Only</option>
                <option value="all">No Dietary Restrictions</option>
                <option value="vegan">Vegan / Dairy-Free</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                SMS / WhatsApp Alert Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-black text-xs transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          </form>

          {/* Role Access Notice */}
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            <strong className="text-slate-700 block mb-1">Role Security Policy:</strong>
            As a student account, you have express pickup permissions. Access to the Staff Kitchen KDS and management financials is restricted.
          </div>
        </div>
      </div>
    </div>
  );
};

