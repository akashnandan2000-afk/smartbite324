import { Outlet, Link } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Sparkles, ArrowRight, Zap } from "lucide-react";

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Top Hackathon Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-800/60 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white font-black text-[10px] uppercase tracking-wider">
              Hackathon Demo
            </span>
            <span className="font-medium text-emerald-200">
              Zero waiting time! Place an order &bull; Pay with Razorpay Test &bull; Get instant pickup QR code.
            </span>
          </div>

          <Link
            to="/menu"
            className="hidden sm:inline-flex items-center gap-1 font-bold text-orange-400 hover:text-orange-300 text-xs shrink-0 transition-colors"
          >
            <span>Order Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Glassmorphic Navigation */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
