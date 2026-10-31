import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogOut, ChefHat, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const AccessDenied = () => {
  const { user, logout, login } = useAuth();

  const handleSwitchToStaff = async () => {
    try {
      await login("staff@canteen.smartbite.com", "admin123");
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <div className="bg-white rounded-3xl border border-rose-200 shadow-xl p-8 text-center space-y-6">
        
        {/* Shield Icon */}
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-10 h-10 stroke-[2]" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black uppercase tracking-wider">
            Role-Based Access Control (RBAC)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Access Restricted &bull; Staff Only
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            You are signed in as a <strong className="text-emerald-800">Student</strong> ({user?.fullName || "Student Account"} &bull; {user?.studentId || "ID"}). 
            Kitchen Display System (KDS) tickets and canteen analytics are restricted to authorized culinary staff and administrators.
          </p>
        </div>

        {/* Current User Pill */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Active User</span>
            <span className="font-black text-slate-800">{user?.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Account Role</span>
            <span className="font-extrabold text-rose-600 uppercase text-[10px] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {user?.role}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Department</span>
            <span className="font-semibold text-slate-700">{user?.department}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Student Menu</span>
          </Link>

          <button
            onClick={handleSwitchToStaff}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md shadow-orange-600/20 transition-all cursor-pointer"
          >
            <ChefHat className="w-4 h-4" />
            <span>Switch to Staff Demo</span>
          </button>
        </div>

      </div>
    </div>
  );
};

