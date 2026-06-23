import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { ChefHat, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToKitchenOrders, updateOrderStatus } from "@/lib/orderService";
import { useAuth } from "@/context/AuthContext";
import OrderCard from "@/components/OrderCard";
import type { Order, OrderStatus } from "@/types";

function getActionsForOrder(order: Order) {
  if (order.status === "placed") return [{ label: "Accept", status: "accepted" as OrderStatus }, { label: "Cancel", status: "cancelled" as OrderStatus }];
  if (order.status === "accepted") return [{ label: "Start Preparing", status: "preparing" as OrderStatus }];
  if (order.status === "preparing") return [{ label: "Mark Ready", status: "ready" as OrderStatus }];
  if (order.status === "ready" && order.type !== "delivery") return [{ label: "Complete", status: "completed" as OrderStatus }];
  return [];
}

export default function KitchenPage() {
  const { user, isKitchen } = useAuth();
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [newCount, setNewCount] = useState(0);
  const prevIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!isKitchen) { navigate("/"); return; }
    const unsub = subscribeToKitchenOrders((incoming) => {
      const newOnes = incoming.filter((o) => !prevIds.current.has(o.id));
      if (newOnes.length > 0) {
        setNewCount((n) => n + newOnes.length);
        newOnes.forEach((o) => prevIds.current.add(o.id));
      }
      incoming.forEach((o) => prevIds.current.add(o.id));
      setOrders(incoming);
    });
    return unsub;
  }, [user, isKitchen]);

  async function handleAction(orderId: string, status: OrderStatus) {
    const o = orders.find((x) => x.id === orderId);
    await updateOrderStatus(orderId, status, o?.customerId);
  }

  const columns: { label: string; statuses: OrderStatus[]; color: string }[] = [
    { label: "New Orders", statuses: ["placed"], color: "border-yellow-400" },
    { label: "Accepted", statuses: ["accepted"], color: "border-blue-400" },
    { label: "Preparing", statuses: ["preparing"], color: "border-orange-400" },
    { label: "Ready", statuses: ["ready"], color: "border-green-400" },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-gradient-to-r from-orange-700 to-amber-700 text-white py-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="w-7 h-7" />
            <div>
              <h1 className="text-2xl font-extrabold">Kitchen Dashboard</h1>
              <p className="text-white/70 text-sm">Live order queue</p>
            </div>
          </div>
          {newCount > 0 && (
            <button
              onClick={() => setNewCount(0)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              <Bell className="w-4 h-4" />
              {newCount} new
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colOrders = orders.filter((o) => col.statuses.includes(o.status));
            return (
              <div key={col.label} className={`bg-card border-t-4 ${col.color} rounded-2xl p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-foreground">{col.label}</h2>
                  <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {colOrders.length}
                  </span>
                </div>
                <div className="space-y-3 min-h-32">
                  <AnimatePresence>
                    {colOrders.map((o) => (
                      <motion.div
                        key={o.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <OrderCard
                          order={o}
                          actions={getActionsForOrder(o)}
                          onAction={handleAction}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {colOrders.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8 opacity-60">No orders</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
