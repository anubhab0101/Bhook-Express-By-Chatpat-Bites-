import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, ChefHat, LogOut, User, Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { cn } from "@/lib/utils";

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
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <ChefHat className="w-6 h-6" />
            {settings.name || "Restaurant"}
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location === l.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-muted transition-colors">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link href="/cart" className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                </Link>
                <button onClick={signOut} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Sign In
              </Link>
            )}

            <button className="md:hidden p-2" onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location === l.href ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
