import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Search, Grid, List as ListIcon, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ensureMenuSeeded, subscribeToMenu } from "@/lib/menuService";
import { useAuth } from "@/context/AuthContext";
import MenuCard from "@/components/MenuCard";
import BurgerLoader from "@/components/BurgerLoader";
import ScrollBounceNavigator from "@/components/ScrollBounceNavigator";
import type { MenuItem, MenuCategory } from "@/types";
import { MENU_CATEGORIES } from "@/types";

export default function MenuPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<MenuCategory | "All">("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const searchStr = useSearch();
  const tableParam = new URLSearchParams(searchStr).get("table");

  useEffect(() => {
    const unsub = subscribeToMenu((data) => {
      setItems(data);
      setIsLoading(false);
    });
    ensureMenuSeeded().catch((err) => console.error("Menu seed failed", err));
    return unsub;
  }, []);

  const filtered = items.filter((i) => {
    const matchCat = activeCategory === "All" || i.category === activeCategory;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Calculate "Most Ordered" (Biryani, Chicken Kasa, Lachha Roll or fallbacks)
  const mostOrdered = items.filter(i => 
    i.name.toLowerCase().includes("biryani") || 
    i.name.toLowerCase().includes("biriyani") || 
    i.name.toLowerCase().includes("chicken kasa") ||
    i.name.toLowerCase().includes("kasa") ||
    i.name.toLowerCase().includes("lachha roll") ||
    i.name.toLowerCase().includes("roll")
  ).slice(0, 3);
  
  // If we didn't find those specifically, fallback to some featured ones
  const finalMostOrdered = mostOrdered.length >= 3 ? mostOrdered : items.filter(i => i.featured).slice(0, 3);

  return (
    <div className="w-full bg-background pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-900 to-orange-800 text-white py-12 px-6 shadow-inner">
        <div className="max-w-6xl mx-auto">
          {tableParam && (
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-3 py-1.5 rounded-full mb-4">
              Table {tableParam}
            </div>
          )}
          <h1 className="text-4xl font-extrabold mb-2">Our Menu</h1>
          <p className="text-white/80">Fresh ingredients, bold flavors — order what you love</p>

          {/* Search */}
          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/20 text-white placeholder:text-white/50 border border-white/30 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8">
        {/* Most Ordered Section (Trust Building) */}
        {finalMostOrdered.length > 0 && search === "" && activeCategory === "All" && (
          <div className="mb-12 bg-amber-50/50 dark:bg-amber-950/20 p-6 rounded-3xl border border-amber-200 dark:border-amber-900 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="text-orange-500 w-6 h-6 animate-pulse" />
              <h2 className="text-2xl font-bold text-foreground">Most Ordered Food</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {finalMostOrdered.map(item => (
                <MenuCard key={item.id} item={item} isList={false} />
              ))}
            </div>
          </div>
        )}

        {/* Categories & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sticky top-16 z-30 bg-background/95 backdrop-blur py-3 border-b border-border">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
            {(["All", ...MENU_CATEGORIES] as (MenuCategory | "All")[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md scale-105"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-muted p-1 rounded-xl self-start sm:self-auto flex-shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        {isLoading ? (
          <BurgerLoader />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-lg font-semibold">No items found</p>
          </div>
        ) : (
          <motion.div
            layout
            className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}
          >
            <AnimatePresence>
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <MenuCard item={item} isList={viewMode === 'list'} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Auto-navigate to Profile on scroll end via bouncy navigator */}
      <ScrollBounceNavigator target={user ? "/profile" : "/login"} text="Scroll more to open profile 👇" />
    </div>
  );
}
