import { useState } from "react";
import { Plus, Minus, Star, Clock, Flame, Check, AlertCircle } from "lucide-react";
import { formatCurrency } from "../utils/formatters";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

export const MenuCard = ({ item }) => {
  const { items, addItem, updateQuantity } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if item is already in cart
  const cartItem = items.find((i) => i.id === item.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isAvailable = item.isAvailable !== false;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!isAvailable) {
      toast.warning(`${item.name} is currently sold out.`);
      return;
    }
    addItem(item);
    toast.success(`${item.name} added to tray!`, {
      icon: "🥗",
      style: {
        background: "#064e3b",
        color: "#ffffff",
        fontWeight: "600",
        borderRadius: "12px"
      }
    });
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    updateQuantity(item.id, 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateQuantity(item.id, -1);
  };

  return (
    <div className={`group relative bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
      isAvailable 
        ? "border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/40" 
        : "border-slate-200/60 opacity-80 bg-slate-50/50 shadow-none"
    }`}>
      {/* Image Area with Badges & Overlays */}
      <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-slate-100">
        {/* Placeholder skeleton while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
        )}

        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } ${!isAvailable ? "grayscale-[40%]" : ""}`}
        />

        {/* Gradient shadow for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/20 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Veg / Non-Veg Indicator */}
          <div className="w-6 h-6 rounded-md bg-white/95 backdrop-blur-md flex items-center justify-center border border-slate-200 shadow-sm">
            <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center p-0.5 ${
              item.isVeg ? "border-emerald-600" : "border-rose-600"
            }`}>
              {item.isVeg ? (
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
              ) : (
                <div className="w-0 h-0 border-x-[3.5px] border-x-transparent border-b-[6px] border-b-rose-600" />
              )}
            </div>
          </div>

          {/* Availability Status Chip */}
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
            isAvailable
              ? "bg-emerald-600/90 text-white border border-emerald-400/40"
              : "bg-rose-600/90 text-white border border-rose-400/40"
          }`}>
            {isAvailable ? "Available" : "Sold Out"}
          </span>
        </div>

        {/* Bottom Image Stats (Category & Prep Time) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium pointer-events-none">
          <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[11px] font-bold text-emerald-300">
            {item.category}
          </span>
          {item.prepTime && (
            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              {item.prepTime}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and Special Badge */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
              {item.badge || item.category}
            </span>

            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-xs font-bold text-amber-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              <span>{item.rating || 4.8}</span>
              {item.reviewsCount && (
                <span className="text-slate-400 font-normal">({item.reviewsCount})</span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-emerald-900 transition-colors line-clamp-1">
            {item.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Pricing & Interactive Add/Counter Section */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">
                {formatCurrency(item.price)}
              </span>
              {item.originalPrice && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  {formatCurrency(item.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              {item.category}
            </span>
          </div>

          {/* Add to Cart / Quantity Stepper */}
          {!isAvailable ? (
            <button
              disabled
              className="px-3.5 py-2 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : inCartQty === 0 ? (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-orange-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="inline-flex items-center rounded-xl bg-emerald-900 text-white shadow-md border border-emerald-700/60 p-1">
              <button
                onClick={handleDecrement}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-emerald-800 active:scale-90 text-white transition-all cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <span className="w-7 text-center font-black text-xs text-emerald-200">
                {inCartQty}
              </span>
              <button
                onClick={handleIncrement}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-600 hover:bg-orange-500 active:scale-90 text-white transition-all cursor-pointer"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
