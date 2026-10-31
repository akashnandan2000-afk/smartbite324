import { SmartBiteLogo } from "../components/SmartBiteLogo";
import { ShieldCheck, Sparkles, MapPin, Phone, Mail, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-emerald-950 text-white border-t border-emerald-900 mt-auto pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-emerald-900/80">
          {/* Brand Col */}
          <div className="space-y-4">
            <SmartBiteLogo size="lg" variant="dark" />
            <p className="text-xs text-emerald-200/70 leading-relaxed">
              SmartBite is an intelligent campus dining ecosystem designed to eliminate counter crowding. Order from class, pay via Razorpay Sandbox, and collect freshly prepped meals via instant QR tokens.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-[11px] font-semibold text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>providence</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li>
                <Link to="/menu" className="hover:text-orange-400 transition-colors">
                  &bull; Today's Live Menu &amp; Specials
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-orange-400 transition-colors">
                  &bull; Active Pickup QR Tokens
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-orange-400 transition-colors">
                  &bull; Kitchen Display System (KDS)
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-orange-400 transition-colors">
                  &bull; View Current Food Tray
                </Link>
              </li>
            </ul>
          </div>

          {/* Canteen Hours & Campus Location */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
              Canteen Operational Hours
            </h4>
            <div className="space-y-2 text-xs text-emerald-200/80">
              <p className="flex justify-between border-b border-emerald-900/60 pb-1">
                <span>Breakfast Session</span>
                <span className="font-bold text-white">08:00 AM - 11:30 AM</span>
              </p>
              <p className="flex justify-between border-b border-emerald-900/60 pb-1">
                <span>Lunch &amp; Meals</span>
                <span className="font-bold text-white">12:00 PM - 03:30 PM</span>
              </p>
              <p className="flex justify-between pb-1">
                <span>Evening Snacks &amp; Shakes</span>
                <span className="font-bold text-white">04:00 PM - 08:30 PM</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-300/80 pt-1">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Student Activity Center, Counter #1 &amp; #2</span>
            </div>
          </div>

          {/* Payment & Security */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
              Payment Integrations
            </h4>
            <p className="text-xs text-emerald-200/70">
              Protected transactions powered by Razorpay Test Sandbox. Supports simulated UPI, GPay, Paytm, and Student Wallets.
            </p>
            <div className="p-3.5 rounded-xl bg-emerald-900/40 border border-emerald-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Encrypted Sandbox Checkout</span>
              </div>
              <div className="text-[10px] text-emerald-300/60">
                Simulated payments for demonstration purposes. No real currency deducted.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/60">
          <div>
            &copy; {new Date().getFullYear()} <strong className="text-white">SmartBite Canteen</strong>. Designed with React, Tailwind CSS, Firebase &amp; Razorpay.
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-200/80">
            <span>providence collague</span>
            <span className="text-orange-500">&bull;</span>
            <span className="text-emerald-400 font-semibold">Zero-Queue Dining</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
