import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Sparkles, 
  Clock, 
  QrCode, 
  ShieldCheck, 
  Flame, 
  UtensilsCrossed, 
  Users, 
  Star,
  ChevronRight,
  TrendingUp,
  ChefHat,
  Search,
  CheckCircle2,
  Zap,
  Coffee,
  Heart,
  Timer,
  Award,
  Smartphone,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { MENU_ITEMS, CATEGORIES } from "../utils/menuData";
import { MenuCard } from "../components/MenuCard";

export const HomePage = () => {
  // Menu filter state on homepage
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);

  // Popular / Bestseller dishes
  const popularDishes = useMemo(() => {
    return MENU_ITEMS.filter((item) => item.trending || item.rating >= 4.8).slice(0, 3);
  }, []);

  // Filtered menu dishes for interactive homepage menu section
  const filteredMenu = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchCat = selectedCategory === "All" || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchVeg = vegOnly ? item.isVeg : true;
      return matchCat && matchSearch && matchVeg;
    });
  }, [selectedCategory, searchQuery, vegOnly]);

  return (
    <div className="space-y-20 sm:space-y-28 pb-20 overflow-hidden">
      
      {/* 1. HERO SECTION (HOME) */}
      <section className="relative overflow-hidden hero-pattern text-white pt-16 pb-24 sm:pt-20 sm:pb-32 border-b border-emerald-900/60">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 right-1/10 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Headline & Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* College Hackathon Live Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold backdrop-blur-md shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Next-Gen Smart Canteen &bull; Zero Waiting Queue</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
                Hungry in Class? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
                  Pre-Order Meals.
                </span> <br />
                <span className="text-orange-500">Pick Up in 5 Mins.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-emerald-100/80 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                SmartBite connects students directly to the campus kitchen. Browse live availability, pay via Razorpay test mode, and show your personalized QR token at the express pickup counter.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="#popular-food"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-sm shadow-xl shadow-orange-600/30 transition-all duration-200 cursor-pointer"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Order Popular Food</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#full-menu"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-emerald-900/70 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-200 font-bold text-sm backdrop-blur-md transition-all duration-200 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Explore Full Menu</span>
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-emerald-900/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-2xl font-black text-white">5.8 mins</div>
                  <div className="text-xs text-emerald-300/70">Avg Prep Speed</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-orange-400">100%</div>
                  <div className="text-xs text-emerald-300/70">Fresh &amp; Hygienic</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400">₹0 Cash</div>
                  <div className="text-xs text-emerald-300/70">Instant QR Pickup</div>
                </div>
              </div>
            </div>

            {/* Right Hero Montage with Floating Glassmorphic Badges */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md">
                
                {/* Main Hero Food Image */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/70 bg-emerald-950">
                  <img
                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
                    alt="Artisan campus meal burger"
                    className="w-full h-84 sm:h-96 object-cover object-center transform hover:scale-106 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/40 to-transparent" />
                  
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="px-3 py-1 rounded-full bg-orange-600 text-[10px] font-black uppercase tracking-wider shadow-md">
                      Chef's Special Recommendation
                    </span>
                    <h3 className="text-xl font-black text-white mt-1.5">
                      Tandoori Paneer Smash Burger
                    </h3>
                    <p className="text-xs text-emerald-200/80">
                      Smoked cottage cheese steak, melted cheddar &amp; mint mayo &bull; ₹95
                    </p>
                  </div>
                </div>

                {/* Floating Glassmorphic Card: Token Call */}
                <div className="absolute -top-6 -left-6 sm:-left-8 bg-white/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-xl max-w-xs animate-subtle-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                      <ChefHat className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                        <span className="text-[10px] uppercase font-black text-emerald-700">Order Ready!</span>
                      </div>
                      <p className="text-xs font-black text-slate-800">Token #BITE-9421 &bull; Counter 1</p>
                    </div>
                  </div>
                </div>

                {/* Floating Glassmorphic Card: Payment Approved */}
                <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-emerald-900/95 text-white backdrop-blur-xl p-3.5 rounded-2xl border border-emerald-600/50 shadow-xl max-w-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block">
                        Razorpay Test Mode
                      </span>
                      <span className="text-xs font-black text-white">
                        ₹165 Verified &bull; QR Active
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* LIVE CAMPUS SERVING COUNTERS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-16 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Live Kitchen Telemetry</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Campus Serving Stations Today
              </h2>
            </div>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1.5 text-xs font-black text-orange-600 hover:text-orange-700 transition-colors"
            >
              <span>View Kitchen Display System (KDS)</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            {/* Station 1 */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
                  Station #1 &bull; South &amp; Breakfast
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-1 block">
                  Serving Token #42
                </span>
                <span className="text-xs text-slate-500">Wait: 4 mins &bull; 2 orders in queue</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold">
                Fast Pick
              </span>
            </div>

            {/* Station 2 */}
            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-900 block">
                  Station #2 &bull; Burgers &amp; Meals
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-1 block">
                  Serving Token #58
                </span>
                <span className="text-xs text-slate-500">Wait: 7 mins &bull; 4 orders in queue</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-orange-600 text-white text-xs font-extrabold">
                Active
              </span>
            </div>

            {/* Station 3 */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-900 block">
                  Station #3 &bull; Shakes &amp; Brews
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-1 block">
                  Serving Token #64
                </span>
                <span className="text-xs text-slate-500">Wait: 2 mins &bull; Instant pickup</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-700 text-white text-xs font-extrabold">
                Instant
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR FOOD SECTION */}
      <section id="popular-food" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-orange-600">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>Campus Bestsellers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Most Popular Dishes Right Now
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Top rated by students this week for quick lunch break turnaround and big flavor.
            </p>
          </div>

          <a
            href="#full-menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-950 text-white hover:bg-emerald-900 font-bold text-xs transition-all shadow-sm"
          >
            <span>See Entire 9+ Dish Menu</span>
            <ArrowRight className="w-4 h-4 text-orange-400" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {popularDishes.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 3. INTERACTIVE HOME MENU SECTION */}
      <section id="full-menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
            <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
            Live Canteen Menu
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Browse By Category &amp; Order
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Cooked to order right inside the campus food court. Select dishes below to customize your tray.
          </p>
        </div>

        {/* Filter Controls: Category pills, Search, Veg toggle */}
        <div className="space-y-4">
          {/* Category Pills Slider */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = cat.id === "All"
                ? MENU_ITEMS.length
                : MENU_ITEMS.filter((i) => i.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-900 text-white shadow-md shadow-emerald-950/20"
                      : "bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200/80"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? "bg-emerald-800 text-emerald-200" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Veg Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food by name or ingredient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>

            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                vegOnly
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="w-3 h-3 rounded-xs border border-emerald-600 flex items-center justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${vegOnly ? "bg-emerald-600" : "bg-transparent"}`} />
              </div>
              <span>Pure Veg Only</span>
            </button>
          </div>
        </div>

        {/* Dynamic Dish Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredMenu.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 4. HOW SMARTBITE WORKS SECTION */}
      <section className="bg-emerald-950 text-white py-18 sm:py-24 border-y border-emerald-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-orange-400 block mb-2">
              Fast &amp; Predictable Dining
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              How SmartBite Works
            </h2>
            <p className="text-sm text-emerald-200/70 mt-2">
              From lecture seat to hot lunch in four simple, frictionless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-emerald-900/40 border border-emerald-800/80 p-7 rounded-3xl relative hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black text-lg flex items-center justify-center mb-5 shadow-lg shadow-orange-600/30">
                1
              </div>
              <h3 className="font-black text-lg text-white mb-2">
                Order From Class
              </h3>
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                Open the SmartBite app 10 minutes before the interval bell. Browse live availability and customize spice or toppings.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-emerald-900/40 border border-emerald-800/80 p-7 rounded-3xl relative hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center mb-5 shadow-lg shadow-emerald-600/30">
                2
              </div>
              <h3 className="font-black text-lg text-white mb-2">
                Pay via Razorpay Sandbox
              </h3>
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                Simulate instant checkout via UPI, Google Pay, or Student Wallet. No loose coins, no cash counter friction.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-emerald-900/40 border border-emerald-800/80 p-7 rounded-3xl relative hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center mb-5 shadow-lg shadow-amber-500/30">
                3
              </div>
              <h3 className="font-black text-lg text-white mb-2">
                Kitchen Preps Live
              </h3>
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                Orders appear on the chefs' Kitchen Display System (KDS). Real-time telemetry lets you track preparation stages.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-emerald-900/40 border border-emerald-800/80 p-7 rounded-3xl relative hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white font-black text-lg flex items-center justify-center mb-5 shadow-lg shadow-teal-500/30">
                4
              </div>
              <h3 className="font-black text-lg text-white mb-2">
                Scan QR Token &amp; Collect
              </h3>
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                Walk straight to Counter #1 express hatch. Flash your SVG QR token on your screen, grab piping hot food, and enjoy!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider inline-block mb-2">
            Built For Smart Campuses
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Engineered Features That Impress
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Powerful real-time technologies combined into a frictionless dining experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black">
              <QrCode className="w-6 h-6 text-emerald-700" />
            </div>
            <h3 className="font-black text-lg text-slate-900">
              Scannable QR Verification
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              High-contrast dynamic SVG QR tokens generated via `qrcode.react`. Eliminates misplaced receipts and counter confusion.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-black">
              <ChefHat className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-black text-lg text-slate-900">
              Live Kitchen Display (KDS)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kitchen staff update ticket statuses (*Cooking &rarr; Ready &rarr; Picked*). Live alerts push to the student's screen automatically.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6 text-teal-700" />
            </div>
            <h3 className="font-black text-lg text-slate-900">
              Razorpay Sandbox Integration
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Safe testing simulation for hackathons. Experience full UPI &amp; card payment authorization with zero financial risk.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
              <TrendingUp className="w-6 h-6 text-amber-700" />
            </div>
            <h3 className="font-black text-lg text-slate-900">
              Rush Hour Crowd Analytics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Recharts bar and pie graphs visualize counter throughput and peak lunch surges (12 PM &ndash; 1:30 PM) for staff prep.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-black">
              <Heart className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="font-black text-lg text-slate-900">
              Calorie &amp; Nutrition Clarity
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every dish features explicit calorie badges and spice scales so students make mindful, healthy campus eating choices.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
              <Smartphone className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-black text-lg text-slate-900">
              Zero-Install Mobile Friendly
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Engineered with responsive Tailwind CSS. Works on laptops during study sessions and smartphones between lecture halls.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BENEFITS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 rounded-3xl text-white p-8 sm:p-14 border border-emerald-700/50 shadow-2xl relative overflow-hidden">
          {/* Subtle bg glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mb-12">
            <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-[11px] font-black uppercase tracking-wider inline-block mb-3">
              Direct Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">
              Why Campus Loves SmartBite
            </h2>
            <p className="text-sm text-emerald-200/80 mt-2 leading-relaxed">
              Solving the universal campus challenge: long crowded lines that eat away entire recess periods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Student Benefits */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                For Students &amp; Faculty
              </h3>

              <ul className="space-y-3 text-xs sm:text-sm text-emerald-100/90">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span><strong>Save 15 to 20 Minutes:</strong> Never stand in long billing and waiting lines during recess.</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span><strong>Guaranteed Hot &amp; Fresh:</strong> Kitchen prepares orders precisely timed to your pickup.</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span><strong>Exclusive Campus Discounts:</strong> Save ₹50 on combo meals using promo codes like <code>HACKATHON50</code>.</span>
                </li>
              </ul>
            </div>

            {/* Canteen Staff Benefits */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-300" />
                For Canteen Staff &amp; Management
              </h3>

              <ul className="space-y-3 text-xs sm:text-sm text-emerald-100/90">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span><strong>Zero Cash Handling Errors:</strong> Cashless payments eliminate register discrepancies and change shortages.</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span><strong>Predictable Batch Prep:</strong> Chefs see incoming orders 10 minutes ahead, reducing food waste by 30%.</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span><strong>Calm, Orderly Counter:</strong> Counter chaos is replaced by a civilized single-file QR pickup hatch.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">
              Live Hackathon Demo Ready
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Ready to Order Delicious Campus Food?
            </h2>
            <p className="text-sm text-slate-500">
              Place a simulated order now to experience the full end-to-end QR flow.
            </p>
          </div>

          <a
            href="#full-menu"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-sm shadow-xl shadow-orange-600/30 transition-all cursor-pointer"
          >
            <span>Start Your Order</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </a>
        </div>
      </section>

    </div>
  );
};
