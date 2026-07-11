import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import type { MenuItem } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const FUN_TEXTS = ["Order me! 🤤", "Chef's Special! 👨‍🍳", "Super Tasty! 🌶️", "Craving this? 🍕", "Must Try! ⭐"];

export default function MenuCard({ item, isList = false }: { item: MenuItem; isList?: boolean }) {
  const { items, addItem, removeItem, updateQty } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [showText, setShowText] = useState(false);
  
  const cartItem = items.find((i) => i.menuItem.id === item.id);
  const qty = cartItem?.quantity || 0;
  
  // Create a better hash from item.id to ensure variety, override if unavailable
  const hash = Array.from(item.id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const funText = !item.available 
    ? "I am not available now. Order another dish pls.." 
    : FUN_TEXTS[hash % FUN_TEXTS.length];

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isHovered) {
      timeout = setTimeout(() => setShowText(true), 500);
    } else {
      setShowText(false);
    }
    return () => clearTimeout(timeout);
  }, [isHovered]);

  function addAfterLogin() {
    if (!user) {
      navigate("/login");
      return;
    }
    addItem(item);
  }

  return (
    <div className={`bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group ${isList ? 'flex h-36' : ''}`}>
      <div 
        className={`relative bg-muted overflow-hidden ${isList ? 'w-36 h-full flex-shrink-0' : 'h-44'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
        
        {item.featured && !isList && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full z-10">Featured</span>
        )}

        {/* Fun Thinking Cloud Animation */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 10, x: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 10, x: -10 }}
              className="absolute top-2 right-2 bg-white text-black px-3 py-1.5 rounded-2xl rounded-br-sm shadow-xl z-20 flex items-center justify-center min-w-[60px] min-h-[32px] pointer-events-none"
            >
              {!showText ? (
                <div className="flex gap-1 items-center">
                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-black rounded-full" />
                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-black rounded-full" />
                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-black rounded-full" />
                </div>
              ) : (
                <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-[10px] sm:text-xs font-bold whitespace-nowrap">
                  {funText}
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!item.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="text-white font-semibold text-sm">Unavailable</span>
          </div>
        )}
      </div>

      <div className={`p-4 flex flex-col justify-between ${isList ? 'flex-1' : ''}`}>
        <div>
          <div className="mb-1">
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">{item.category}</span>
          </div>
          <h3 className="font-semibold text-foreground mb-1 line-clamp-1 text-sm sm:text-base">{item.name}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-primary text-base sm:text-lg">{formatCurrency(item.price)}</span>

          {item.available ? (
            qty > 0 ? (
              <div className="flex items-center gap-1 sm:gap-2 bg-primary rounded-full px-1">
                <button
                  onClick={() => updateQty(item.id, qty - 1)}
                  className="text-primary-foreground w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-primary-foreground font-bold text-xs sm:text-sm w-3 sm:w-4 text-center">{qty}</span>
                <button
                  onClick={addAfterLogin}
                  className="text-primary-foreground w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={addAfterLogin}
                className="bg-gradient-to-br from-red-600 to-orange-500 text-white rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:opacity-90 transition-all hover:scale-105 shadow-md"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
