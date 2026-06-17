import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ensureMenuSeeded, subscribeToMenu } from "@/lib/menuService";
import { useAuth } from "@/context/AuthContext";
import MenuCard from "@/components/MenuCard";
import type { MenuItem, MenuCategory } from "@/types";
import { MENU_CATEGORIES } from "@/types";

export default function MenuPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<MenuCategory | "All">("All");
  const [search, setSearch] = useState("");
  const searchStr = useSearch();
  const tableParam = new URLSearchParams(searchStr).get("table");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }
    if (!user) return;
    const unsub = subscribeToMenu(setItems);
    ensureMenuSeeded().catch((err) => console.error("Menu seed failed", err));
    return unsub;
  }, [user, loading, navigate]);

  if (!user) return null;

  const filtered = items.filter((i) => {
    const matchCat = activeCategory === "All" || i.category === activeCategory;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-900 to-orange-800 text-white py-12 px-6">
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
              className="w-full bg-white/20 text-white placeholder:text-white/50 border border-white/30 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-16 z-30 bg-background border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
            {(["All", ...MENU_CATEGORIES] as (MenuCategory | "All")[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-lg font-semibold">No items found</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
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
                  <MenuCard item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
