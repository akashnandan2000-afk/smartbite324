import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  Flame, 
  Clock, 
  ArrowUpDown, 
  X,
  Coffee,
  Utensils,
  Sun,
  Zap,
  Soup,
  Database,
  RefreshCw,
  Award,
  CheckCircle2
} from "lucide-react";
import { MENU_CATEGORIES, SAMPLE_MENU_ITEMS } from "../utils/menuData";
import { getMenuItems, seedSampleMenuToFirestore } from "../services/menuService";
import { MenuCard } from "../components/MenuCard";
import { toast } from "react-toastify";

export const MenuPage = () => {
  const [items, setItems] = useState(SAMPLE_MENU_ITEMS);
  const [dataSource, setDataSource] = useState("local");
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dietFilter, setDietFilter] = useState("all"); // all, veg, nonveg
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [sortBy, setSortBy] = useState("popular"); // popular, priceAsc, priceDesc, rating

  // Load menu items from Firestore or local demo
  useEffect(() => {
    let isMounted = true;
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const res = await getMenuItems();
        if (isMounted) {
          setItems(res.items);
          setDataSource(res.source);
        }
      } catch (err) {
        console.error("Error loading menu:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMenu();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSyncFirestore = async () => {
    try {
      toast.info("Syncing sample menu to Cloud Firestore...");
      const res = await seedSampleMenuToFirestore();
      toast.success(`Successfully synced ${res.count} items to Firestore!`);
      const updated = await getMenuItems();
      setItems(updated.items);
      setDataSource(updated.source);
    } catch (err) {
      toast.error("Could not sync to Firestore: " + err.message);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Breakfast":
        return Sun;
      case "Lunch":
        return Utensils;
      case "Snacks":
        return Zap;
      case "Beverages":
        return Coffee;
      case "Special Items":
        return Award;
      default:
        return Sparkles;
    }
  };

  const filteredItems = useMemo(() => {
    let result = items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        item.category === selectedCategory ||
        (selectedCategory === "Special Items" && (item.isSpecial || item.category === "Special Items"));

      const matchesDiet =
        dietFilter === "all"
          ? true
          : dietFilter === "veg"
          ? item.isVeg
          : !item.isVeg;

      const matchesAvailability = availabilityOnly ? item.isAvailable !== false : true;

      return matchesSearch && matchesCategory && matchesDiet && matchesAvailability;
    });

    if (sortBy === "priceAsc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "popular") {
      result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    return result;
  }, [items, search, selectedCategory, dietFilter, availabilityOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl emerald-gradient p-8 sm:p-10 text-white overflow-hidden shadow-xl border border-emerald-700/50">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              Live Campus Dining Menu
            </span>

            {/* Firestore vs Local Demo Mode Badge */}
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 backdrop-blur-md border ${
              dataSource === "firestore"
                ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/40"
                : "bg-white/15 text-orange-200 border-white/20"
            }`}>
              <Database className="w-3.5 h-3.5" />
              <span>{dataSource === "firestore" ? "Cloud Firestore Connected" : "Local Demo Mode Active"}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Fresh Canteen Specials &bull; 10 Dishes Available
          </h1>
          <p className="text-sm text-emerald-100/80 leading-relaxed max-w-2xl">
            Choose from authentic Biriyani, flaky Porottas, crisp Dosas, hot Chai, and thirst-quenching Fresh Juices. Cooked fresh daily in the campus cafeteria.
          </p>
        </div>
      </div>

      {/* Categories & Filter Controls */}
      <div className="space-y-4">
        {/* Category Pills Slider */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {MENU_CATEGORIES.map((cat) => {
            const Icon = getCategoryIcon(cat.id);
            const isSelected = selectedCategory === cat.id;
            const count =
              cat.id === "All"
                ? items.length
                : cat.id === "Special Items"
                ? items.filter((i) => i.isSpecial || i.category === "Special Items").length
                : items.filter((i) => i.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-emerald-900 text-white shadow-md shadow-emerald-950/20"
                    : "bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200/90"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-orange-400" : "text-emerald-700"}`} />
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

        {/* Search & Secondary Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name (e.g. Biriyani, Porotta, Tea)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-between md:justify-end">
            {/* Diet Filter Buttons */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs">
              <button
                onClick={() => setDietFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  dietFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietFilter("veg")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  dietFilter === "veg" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Veg</span>
              </button>
              <button
                onClick={() => setDietFilter("nonveg")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  dietFilter === "nonveg" ? "bg-white text-rose-800 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <span>Non-Veg</span>
              </button>
            </div>

            {/* In-Stock Only Toggle */}
            <button
              onClick={() => setAvailabilityOnly(!availabilityOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                availabilityOnly
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/15"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${availabilityOnly ? "text-emerald-600" : "text-slate-400"}`} />
              <span>Available Only</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer text-slate-800 font-bold"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <div className="min-h-72 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
            <Flame className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900">No Dishes Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            We couldn't find any items matching your active search or filters.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setDietFilter("all");
              setAvailabilityOnly(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-900 text-white font-bold text-xs hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Footer Cloud Sync Option for Demonstrators */}
      <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-700" />
          <span>
            Menu source: <strong className="text-slate-800 uppercase">{dataSource}</strong> &bull; {items.length} items loaded.
          </span>
        </div>
        <button
          onClick={handleSyncFirestore}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold shadow-2xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
          <span>Sync 10 Dishes to Cloud Firestore</span>
        </button>
      </div>

    </div>
  );
};
