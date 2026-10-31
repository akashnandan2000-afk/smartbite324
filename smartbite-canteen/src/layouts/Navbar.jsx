import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  ShoppingBag, 
  Clock, 
  BarChart3, 
  UtensilsCrossed, 
  Menu as MenuIcon, 
  X, 
  Sparkles,
  User,
  LogOut,
  ChefHat,
  GraduationCap
} from "lucide-react";
import { SmartBiteLogo } from "../components/SmartBiteLogo";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatters";
import { toast } from "react-toastify";

export const Navbar = () => {
  const { totalCount, totalAmount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  const navLinks = [
    { to: "/", label: "Home", icon: Sparkles },
    { to: "/menu", label: "Menu", icon: UtensilsCrossed },
    { to: "/orders", label: "My Orders & QR", icon: Clock },
    { to: "/analytics", label: "Kitchen Hub", icon: BarChart3 }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Original SmartBite Logo */}
            <Link to="/" className="flex items-center gap-3">
              <SmartBiteLogo size="default" />
            </Link>

            {/* Center: Live Counter Ticker */}
            <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-xs font-semibold text-emerald-900 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span>Campus Counter #1 &bull; Live Wait: <strong className="text-orange-600 font-extrabold">6 mins</strong></span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-900 text-white shadow-sm shadow-emerald-950/20"
                        : "text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/60"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-300" : "text-slate-400"}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: User Profile / Auth buttons & Cart */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Cart Button */}
              <Link
                to="/cart"
                className="group relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-orange-600/30 transition-all duration-200"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                  {totalCount > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 w-4 h-4 rounded-full bg-emerald-900 text-emerald-200 text-[10px] font-black flex items-center justify-center border-2 border-white animate-bounce">
                      {totalCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Tray</span>
                {totalAmount > 0 && (
                  <span className="hidden lg:inline-block font-black pl-1.5 border-l border-white/25">
                    {formatCurrency(totalAmount)}
                  </span>
                )}
              </Link>

              {/* Auth / Profile Area */}
              {isAuthenticated ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 border border-slate-200 text-slate-800 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-800 text-white font-black text-[10px] flex items-center justify-center">
                      {user?.role === "staff" ? (
                        <ChefHat className="w-3.5 h-3.5" />
                      ) : (
                        user?.fullName?.charAt(0) || "U"
                      )}
                    </div>
                    <div className="hidden md:block text-left">
                      <span className="text-xs font-black text-slate-900 block leading-none truncate max-w-24">
                        {user?.fullName?.split(" ")[0]}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                        {user?.role}
                      </span>
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-xl text-xs font-extrabold text-emerald-950 hover:bg-emerald-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm">
          <div className="fixed top-20 left-0 right-0 bg-white border-b border-slate-200 p-6 shadow-2xl space-y-4 animate-in slide-in-from-top-4 duration-200 max-h-[calc(100vh-80px)] overflow-y-auto">
            {/* Live Ticker in Mobile */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Campus Canteen &bull; Active (Avg Wait: 6 min)</span>
            </div>

            {/* User status */}
            {isAuthenticated ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-black text-sm flex items-center justify-center">
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{user?.fullName}</h4>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase">
                      {user?.role} &bull; {user?.studentId}
                    </span>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2.5 py-1 text-xs font-bold text-orange-600 hover:underline"
                >
                  Profile
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl border border-slate-200 text-center font-bold text-xs text-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-emerald-900 text-center font-bold text-xs text-white"
                >
                  Register
                </Link>
              </div>
            )}

            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? "bg-emerald-900 text-white"
                        : "text-slate-700 hover:bg-emerald-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-orange-500" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {isAuthenticated && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
