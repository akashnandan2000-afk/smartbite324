export const SmartBiteLogo = ({ 
  size = "default", 
  variant = "light", 
  showTagline = true,
  className = "" 
}) => {
  const isLarge = size === "lg";
  const isSmall = size === "sm";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Custom Vector Icon */}
      <div
        className={`relative flex items-center justify-center rounded-2xl shadow-md transition-transform duration-300 hover:scale-105 ${
          isLarge ? "w-12 h-12" : isSmall ? "w-8 h-8 rounded-xl" : "w-10 h-10"
        } bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 border border-emerald-700/40 shadow-emerald-950/20`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-3/4 h-3/4 overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle glow / back ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#leafGrad)"
            strokeWidth="3"
            strokeDasharray="6 4"
            strokeOpacity="0.3"
          />

          {/* Organic Leaf / Fresh Canteen Sprout */}
          <path
            d="M50 20C50 20 68 28 68 46C68 56 61 64 50 67C39 64 32 56 32 46C32 28 50 20 50 20Z"
            fill="url(#leafGrad)"
          />

          {/* The Smart "Bite" cutout with appetizing steam swirl */}
          <path
            d="M50 26C58 33 60 42 56 49C52 56 42 58 35 53C37 38 46 29 50 26Z"
            fill="#022c22"
            fillOpacity="0.35"
          />

          {/* Golden Orange Bite Sparkle / Fork Accent */}
          <circle cx="64" cy="30" r="7" fill="url(#orangeGrad)" />
          <path
            d="M62 27L66 33M66 27L62 33"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Sleek cutlery / smile curve at base */}
          <path
            d="M36 72C44 78 56 78 64 72"
            stroke="url(#orangeGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="leafGrad" x1="32" y1="20" x2="68" y2="67" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34d399" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="orangeGrad" x1="56" y1="24" x2="68" y2="76" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fb923c" />
              <stop offset="1" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight leading-none">
          <span
            className={`font-black tracking-tight ${
              isLarge
                ? "text-2xl"
                : isSmall
                ? "text-base"
                : "text-xl"
            } ${variant === "dark" ? "text-white" : "text-emerald-950"}`}
          >
            Smart
          </span>
          <span
            className={`font-black tracking-tight text-orange-600 ${
              isLarge ? "text-2xl" : isSmall ? "text-base" : "text-xl"
            }`}
          >
            Bite
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1 animate-pulse" />
        </div>

        {showTagline && (
          <span
            className={`font-bold uppercase tracking-wider text-[9px] mt-0.5 ${
              variant === "dark" ? "text-emerald-300/80" : "text-emerald-800/70"
            }`}
          >
            Campus Dining &bull; Fast Pick
          </span>
        )}
      </div>
    </div>
  );
};

