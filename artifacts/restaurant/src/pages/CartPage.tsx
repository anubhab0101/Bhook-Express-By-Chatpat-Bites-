import { useState } from "react";
import { useLocation } from "wouter";
import { Trash2, ShoppingBag, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { payWithRazorpay } from "@/lib/paymentService";
import { formatCurrency } from "@/lib/utils";
import type { DeliveryAddress, OrderType } from "@/types";

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, subtotal, tax, total } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const [, navigate] = useLocation();
  const [orderType, setOrderType] = useState<OrderType>("dine_in");
  const [tableNumber, setTableNumber] = useState("");
  const [delivery, setDelivery] = useState<DeliveryAddress>({ name: user?.name || "", phone: user?.phone || "", address: "", landmark: "", pincode: "" });
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [deliverable, setDeliverable] = useState(true);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const finalTotal = total + (orderType === "delivery" ? deliveryCharge : 0);

  async function calculateDeliveryFee(nextDelivery = delivery) {
    setQuoteLoading(true);
    try {
      const response = await fetch("/api/delivery/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerLat: nextDelivery.lat,
          customerLng: nextDelivery.lng,
          address: `${nextDelivery.address} ${nextDelivery.landmark} ${nextDelivery.pincode}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to calculate delivery");
      setDistanceKm(data.distanceKm);
      setDeliveryCharge(data.deliveryCharge);
      setDeliverable(data.deliverable);
      if (!data.deliverable) alert("Address is above 10 km. Delivery order cannot be accepted.");
    } catch (e: any) {
      setDistanceKm(null);
      setDeliveryCharge(0);
      setDeliverable(false);
      alert(e.message || "Unable to calculate delivery fee");
    } finally {
      setQuoteLoading(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Location is not supported in this browser");
      return;
    }
    setQuoteLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextDelivery = { ...delivery, lat: position.coords.latitude, lng: position.coords.longitude };
        setDelivery(nextDelivery);
        calculateDeliveryFee(nextDelivery);
      },
      () => {
        setQuoteLoading(false);
        alert("Location permission is required for delivery distance calculation.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function buildOrderPayload() {
    if (!user) throw new Error("Please sign in first");
    return {
      type: orderType,
      status: "placed" as const,
      items,
      subtotal,
      tax,
      deliveryCharge: orderType === "delivery" ? deliveryCharge : 0,
      total: finalTotal,
      customerId: user.uid,
      customerName: user.name,
      customerPhone: user.phone || delivery.phone,
      tableNumber: orderType === "dine_in" ? tableNumber : undefined,
      deliveryAddress: orderType === "delivery" ? { ...delivery, distanceKm: distanceKm || undefined } : undefined,
      rewardApplied: false,
    };
  }

  async function placeOrder() {
    if (!user) { navigate("/login"); return; }
    if (items.length === 0) return;
    if (orderType === "dine_in" && !tableNumber) { alert("Please enter table number"); return; }
    if (orderType === "delivery" && (!delivery.name || !delivery.phone || !delivery.address || !delivery.pincode)) {
      alert("Please fill all delivery details");
      return;
    }
    if (orderType === "delivery" && (!deliverable || distanceKm == null)) {
      alert("Please calculate delivery distance first. Orders above 10 km are not accepted.");
      return;
    }
    setLoading(true);
    try {
      await payWithRazorpay(buildOrderPayload(), settings.name);
      clearCart();
      navigate("/orders");
    } catch (e: any) {
      alert(e.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <ShoppingBag className="w-16 h-16 opacity-30" />
        <p className="text-xl font-semibold">Your cart is empty</p>
        <button onClick={() => navigate("/menu")} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold hover:opacity-90">
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold mb-6 text-foreground">Your Cart</h1>

        <div className="space-y-3 mb-6">
          <AnimatePresence>
            {items.map((ci) => (
              <motion.div key={ci.menuItem.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-4 bg-card border border-border rounded-xl p-3">
                {ci.menuItem.image && <img src={ci.menuItem.image} alt={ci.menuItem.name} className="w-14 h-14 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{ci.menuItem.name}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(ci.menuItem.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(ci.menuItem.id, ci.quantity - 1)} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted text-sm font-bold">-</button>
                  <span className="w-6 text-center font-semibold">{ci.quantity}</span>
                  <button onClick={() => updateQty(ci.menuItem.id, ci.quantity + 1)} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted text-sm font-bold">+</button>
                </div>
                <span className="font-bold text-primary ml-2 w-16 text-right">{formatCurrency(ci.menuItem.price * ci.quantity)}</span>
                <button onClick={() => removeItem(ci.menuItem.id)} className="text-destructive hover:opacity-70 ml-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <p className="font-semibold mb-3 text-foreground">Order Type</p>
          <div className="grid grid-cols-2 gap-3">
            {([["dine_in", "Dine In"], ["delivery", "Home Delivery"]] as [OrderType, string][]).map(([val, label]) => (
              <button key={val} onClick={() => setOrderType(val)} className={`py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ${orderType === val ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                {label}
              </button>
            ))}
          </div>

          {orderType === "dine_in" && (
            <div className="mt-4">
              <label className="text-sm font-medium text-foreground mb-1 block">Table Number</label>
              <input type="text" placeholder="e.g. 5" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          )}

          {orderType === "delivery" && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Delivery Address</span>
              </div>
              {(["name", "phone", "address", "landmark", "pincode"] as (keyof DeliveryAddress)[]).map((f) => (
                <input key={f} type={f === "phone" ? "tel" : "text"} placeholder={f.charAt(0).toUpperCase() + f.slice(1)} value={(delivery[f] as string) || ""} onChange={(e) => setDelivery((d) => ({ ...d, [f]: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              ))}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={useCurrentLocation} disabled={quoteLoading} className="bg-amber-500 text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-60">
                  {quoteLoading ? "Checking..." : "Use My Location"}
                </button>
                <button type="button" onClick={() => calculateDeliveryFee()} disabled={quoteLoading || !delivery.address || !delivery.pincode} className="border border-border rounded-xl py-2.5 text-sm font-bold disabled:opacity-60">
                  Calculate Fee
                </button>
              </div>
              {distanceKm != null && (
                <p className={`text-sm font-semibold ${deliverable ? "text-emerald-600" : "text-destructive"}`}>
                  Distance: {distanceKm} km - {deliverable ? `Delivery fee ${formatCurrency(deliveryCharge)}` : "Not deliverable"}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <p className="font-semibold mb-3 text-foreground">Payment Method</p>
          <div className="py-2.5 rounded-xl font-semibold text-sm border-2 border-primary bg-primary/10 text-primary text-center">Razorpay / UPI only</div>
          <p className="text-xs text-muted-foreground mt-3">COD is disabled. Orders are created only after payment verification.</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          {tax > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(tax)}</span></div>}
          {orderType === "delivery" && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span>{distanceKm == null ? "Calculate first" : formatCurrency(deliveryCharge)}</span></div>}
          <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
            <span>Total</span><span className="text-primary">{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        <button onClick={placeOrder} disabled={loading || (orderType === "delivery" && (!deliverable || distanceKm == null))} className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:opacity-90 disabled:opacity-60 transition-opacity shadow-lg">
          {loading ? "Placing Order..." : `Pay Now - ${formatCurrency(finalTotal)}`}
        </button>
        {!user && <p className="text-center text-sm text-muted-foreground mt-2">You will be asked to sign in</p>}
      </div>
    </div>
  );
}
