import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { db } from "@/lib/firebase";
import { onValue, ref } from "firebase/database";
import LiveMap from "./LiveMap";
import type { Order } from "@/types";

interface LiveTrackerProps {
  order: Order;
}

export default function LiveTracker({ order }: LiveTrackerProps) {
  const [deliveryBoyLoc, setDeliveryBoyLoc] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (!order.deliveryBoyId) return;
    const locRef = ref(db, `delivery_locations/${order.deliveryBoyId}`);
    const unsub = onValue(locRef, (snap) => {
      if (snap.exists()) setDeliveryBoyLoc(snap.val());
    });
    return () => unsub();
  }, [order.deliveryBoyId]);

  const customerLoc = order.deliveryAddress?.lat && order.deliveryAddress?.lng 
    ? { lat: order.deliveryAddress.lat, lng: order.deliveryAddress.lng } 
    : null;

  return (
    <div className="bg-card border border-border rounded-xl p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-foreground">
        <MapPin className="w-5 h-5 text-primary animate-bounce" />
        <div>
          <p className="text-sm font-bold">Live Tracking</p>
          <p className="text-xs text-muted-foreground">
            {deliveryBoyLoc ? "Tracking live position..." : "Waiting for GPS signal..."}
          </p>
        </div>
      </div>
      <LiveMap 
        customerLoc={customerLoc} 
        deliveryBoyLoc={deliveryBoyLoc} 
      />
    </div>
  );
}
