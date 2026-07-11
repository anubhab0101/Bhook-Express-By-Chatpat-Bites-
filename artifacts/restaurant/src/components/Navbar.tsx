import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, ChefHat, LogOut, User, Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { cn } from "@/lib/utils";
import GlobalNotification from "./GlobalNotification";

export default function Navbar() {
  const { user, signOut, isAdmin, isKitchen, isDelivery } = useAuth();
  const { itemCount } = useCart();
  const { settings } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const [dark, setDark] = useState(false);

  function toggleDark() {
    document.documentElement.classList.toggle("dark");
    setDark((d) => !d);
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    ...(user ? [{ href: "/orders", label: "My Orders" }, { href: "/loyalty", label: "Rewards" }] : []),
    ...(isKitchen ? [{ href: "/kitchen", label: "Kitchen" }] : []),
    ...(isDelivery ? [{ href: "/delivery", label: "Delivery" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base sm:text-lg text-white min-w-0 group">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-8 h-8 object-contain rounded-lg shrink-0 ring-2 ring-amber-500/50 group-hover:ring-amber-400 transition-all" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="truncate bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent font-extrabold">
              {settings.name || "Restaurant"}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm font-medium transition-all px-4 py-1.5 rounded-full",
                  location === l.href 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-4">
            <button onClick={toggleDark} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-amber-400">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link href="/cart" className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-red-500 to-orange-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-1">
                <Link href="/profile" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white px-2.5 py-1.5 rounded-full hover:bg-white/10 transition-all">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="hidden sm:inline font-medium">{user.name.split(" ")[0]}</span>
                </Link>
                <button onClick={signOut} className="p-2 rounded-full hover:bg-red-500/20 transition-colors text-white/50 hover:text-red-400">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105">
                Sign In
              </Link>
            )}

            <button className="md:hidden p-2 rounded-full hover:bg-white/10 text-white/80" onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-white/10 pt-3 mt-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  location === l.href 
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30" 
                    : "hover:bg-white/5 text-white/70 hover:text-white"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
      <GlobalNotification />
    </nav>
  );
}
