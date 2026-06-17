import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { CartItem, MenuItem } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
  tax: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = useMemo(() => `cart:${user?.uid || "guest"}`, [user?.uid]);
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    setItems(saved ? JSON.parse(saved) : []);
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  function addItem(menuItem: MenuItem) {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.menuItem.id !== id));
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) return removeItem(id);
    setItems((prev) =>
      prev.map((i) => (i.menuItem.id === id ? { ...i, quantity: qty } : i))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0);
  const tax = 0;
  const total = subtotal + tax;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, subtotal, tax, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
