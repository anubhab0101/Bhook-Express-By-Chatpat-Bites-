import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ClipboardList, MapPin } from "lucide-react";
import { subscribeToMyOrders } from "@/lib/orderService";
import { updateOrderStatus } from "@/lib/orderService";
import { nowIso, updateItem } from "@/lib/rtdb";
import { db } from "@/lib/firebase";
import { onValue, ref } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import OrderCard from "@/components/OrderCard";
import type { Order } from "@/types";

function LiveTracker({ deliveryBoyId }: { deliveryBoyId: string }) {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (!deliveryBoyId) return;
    const locRef = ref(db, `delivery_locations/${deliveryBoyId}`);
    const unsub = onValue(locRef, (snap) => {
      if (snap.exists()) setLocation(snap.val());
    });
    return () => unsub();
  }, [deliveryBoyId]);

  if (!location) return <div className="text-sm text-muted-foreground animate-pulse p-3 bg-muted rounded-xl flex items-center gap-2"><MapPin className="w-4 h-4" /> Locating Delivery Partner...</div>;

  const gmapsLink = `https://maps.google.com/?q=${location.lat},${location.lng}`;

  return (
    <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-xl p-3 flex items-center justify-between">
      <div className="flex items-center gap-3 text-orange-800 dark:text-orange-300">
        <div className="w-10 h-10 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center">
          <MapPin className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <p className="text-sm font-bold">Arriving Soon</p>
          <p className="text-xs opacity-80">Track partner's live position</p>
        </div>
      </div>
      <a href={gmapsLink} target="_blank" rel="noopener noreferrer" className="bg-orange-600 hover:bg-orange-700 transition-colors text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
        View on Map
      </a>
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviewText, setReviewText] = useState<Record<string, string>>({});
  const [reviewRating, setReviewRating] = useState<Record<string, number>>({});
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const unsub = subscribeToMyOrders(user.uid, setOrders);
    return unsub;
  }, [user]);

  async function markReceived(order: Order) {
    await updateOrderStatus(order.id, "completed", order.customerId);
  }

  async function submitReview(order: Order) {
    const rating = reviewRating[order.id] || 5;
    const comment = reviewText[order.id] || "";
    await updateItem(`orders/${order.id}`, {
      reviewRating: rating,
      reviewComment: comment,
      reviewedAt: nowIso(),
    });
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="bg-gradient-to-br from-amber-900 to-orange-800 text-white py-10 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold">My Orders</h1>
          <p className="text-white/70 mt-1">Track your order history in real time</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ClipboardList className="w-14 h-14 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No orders yet</p>
            <p className="text-sm mt-1">Place your first order from our menu</p>
            <button onClick={() => navigate("/menu")} className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold">
              Order Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="space-y-3">
                <OrderCard order={o} />
                {o.status === "out_for_delivery" && o.deliveryBoyId && (
                  <LiveTracker deliveryBoyId={o.deliveryBoyId} />
                )}
                {o.status === "delivered" && (
                  <button
                    onClick={() => markReceived(o)}
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700"
                  >
                    I Received This Order
                  </button>
                )}
                {["delivered", "completed"].includes(o.status) && !o.reviewedAt && (
                  <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                    <p className="font-bold text-foreground">Review this order</p>
                    <select
                      value={reviewRating[o.id] || 5}
                      onChange={(e) => setReviewRating((prev) => ({ ...prev, [o.id]: Number(e.target.value) }))}
                      className="w-full border border-border rounded-xl px-3 py-2 bg-background"
                    >
                      {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} Stars</option>)}
                    </select>
                    <textarea
                      placeholder="Write your review"
                      value={reviewText[o.id] || ""}
                      onChange={(e) => setReviewText((prev) => ({ ...prev, [o.id]: e.target.value }))}
                      className="w-full border border-border rounded-xl px-3 py-2 bg-background min-h-24"
                    />
                    <button onClick={() => submitReview(o)} className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold">
                      Submit Review
                    </button>
                  </div>
                )}
                {o.reviewedAt && (
                  <div className="bg-muted rounded-xl p-3 text-sm text-muted-foreground">
                    Review submitted: {o.reviewRating || 5} stars
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
