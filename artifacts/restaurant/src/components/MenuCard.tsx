import { Plus, Minus } from "lucide-react";
import { useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import type { MenuItem } from "@/types";

export default function MenuCard({ item }: { item: MenuItem }) {
  const { items, addItem, removeItem, updateQty } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const cartItem = items.find((i) => i.menuItem.id === item.id);
  const qty = cartItem?.quantity || 0;

  function addAfterLogin() {
    if (!user) {
      navigate("/login");
      return;
    }
    addItem(item);
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="relative h-44 bg-muted overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
        {item.featured && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">Featured</span>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Unavailable</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{item.category}</span>
        </div>
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{item.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between">
          <span className="font-bold text-primary text-lg">{formatCurrency(item.price)}</span>

          {item.available ? (
            qty > 0 ? (
              <div className="flex items-center gap-2 bg-primary rounded-full px-1">
                <button
                  onClick={() => updateQty(item.id, qty - 1)}
                  className="text-primary-foreground w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-primary-foreground font-bold text-sm w-4 text-center">{qty}</span>
                <button
                  onClick={addAfterLogin}
                  className="text-primary-foreground w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={addAfterLogin}
                className="bg-primary text-primary-foreground rounded-full w-9 h-9 flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
