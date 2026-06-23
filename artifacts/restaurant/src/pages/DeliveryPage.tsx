import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Truck, MapPin, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToDeliveryOrders, updateOrderStatus } from "@/lib/orderService";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import OrderCard from "@/components/OrderCard";
import LiveTracker from "@/components/LiveTracker";
import type { Order, OrderStatus } from "@/types";

const DELIVERY_ACTIONS: Record<string, { label: string; status: OrderStatus }[]> = {
  ready:            [{ label: "Picked Up", status: "out_for_delivery" as OrderStatus }],
  out_for_delivery: [{ label: "Complete Delivery", status: "completed" as OrderStatus }],
};

export default function DeliveryPage() {
  const { user, isDelivery } = useAuth();
  const { settings } = useSettings();
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!isDelivery) { navigate("/"); return; }
    const unsub = subscribeToDeliveryOrders(setOrders);
    return unsub;
  }, [user, isDelivery]);

  // Geolocation tracking
  useEffect(() => {
    if (!user || !isDelivery) return;
    const activeDeliveries = orders.filter(o => o.status === "out_for_delivery" && o.deliveryBoyId === user.uid);
    if (activeDeliveries.length > 0) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          import("@/lib/rtdb").then(m => m.setItem(`delivery_locations/${user.uid}`, { lat: latitude, lng: longitude, updatedAt: m.nowIso() }));
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
    return;
  }, [orders, user, isDelivery]);

  async function handleAction(orderId: string, status: OrderStatus) {
    const o = orders.find((x) => x.id === orderId);
    const extraData: any = {};
    if (status === "out_for_delivery") extraData.deliveryBoyId = user?.uid;
    await updateOrderStatus(orderId, status, o?.customerId, extraData);
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Truck className="w-7 h-7" />
          <div>
            <h1 className="text-2xl font-extrabold">Delivery Dashboard</h1>
            <p className="text-white/70 text-sm">Active delivery orders</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Ready for Pickup", status: "ready" as OrderStatus, color: "border-green-400" },
            { label: "My Deliveries (Out)", status: "out_for_delivery" as OrderStatus, color: "border-purple-400" },
          ].map((col) => {
            const colOrders = orders.filter((o) => o.status === col.status && (col.status !== "out_for_delivery" || o.deliveryBoyId === user?.uid));
            return (
              <div key={col.label} className={`bg-card border-t-4 ${col.color} rounded-2xl p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-foreground">{col.label}</h2>
                  <span className="bg-muted text-xs font-bold px-2 py-0.5 rounded-full text-muted-foreground">
                    {colOrders.length}
                  </span>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {colOrders.map((o) => (
                      <motion.div key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-background border border-border rounded-xl p-3 mb-2">
                          <OrderCard
                            order={o}
                            actions={DELIVERY_ACTIONS[o.status] || []}
                            onAction={handleAction}
                          />
                          {o.deliveryAddress && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                              <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(settings?.address || "Bhookh Express By Chatpata Bites")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-full font-medium hover:bg-orange-100 transition-colors"
                              >
                                <MapPin className="w-3 h-3" />
                                Restaurant (Pickup)
                              </a>
                              <a
                                href={`https://maps.google.com/?q=${
                                  o.deliveryAddress.lat && o.deliveryAddress.lng 
                                  ? `${o.deliveryAddress.lat},${o.deliveryAddress.lng}`
                                  : encodeURIComponent(o.deliveryAddress.address + " " + o.deliveryAddress.pincode)
                                }`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full font-medium hover:bg-blue-100 transition-colors"
                              >
                                <MapPin className="w-3 h-3" />
                                Drop Location
                              </a>
                              {o.customerPhone && o.status === "out_for_delivery" && (
                                <a
                                  href={`tel:${o.customerPhone}`}
                                  className="flex items-center gap-1 text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full font-medium hover:bg-green-100 transition-colors"
                                >
                                  <Phone className="w-3 h-3" />
                                  Call Customer
                                </a>
                              )}
                            </div>
                          )}
                          {o.status === "out_for_delivery" && (
                            <div className="mt-3">
                              <LiveTracker order={o} />
                            </div>
                          )}
                        </div>
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
