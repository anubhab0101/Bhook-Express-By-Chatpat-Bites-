import { Router } from "express";

const router = Router();

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const radiusKm = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * radiusKm * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function feeForKm(distanceKm: number) {
  if (distanceKm <= 2) return { deliverable: true, deliveryCharge: 15 };
  if (distanceKm <= 5) return { deliverable: true, deliveryCharge: 30 };
  if (distanceKm <= 10) return { deliverable: true, deliveryCharge: 50 };
  return { deliverable: false, deliveryCharge: 0 };
}

async function roadDistanceKm(origin: string, destination: string) {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("origins", origin);
  url.searchParams.set("destinations", destination);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("units", "metric");
  url.searchParams.set("key", key);

  const response = await fetch(url);
  const data = await response.json() as any;
  const element = data?.rows?.[0]?.elements?.[0];
  if (element?.status !== "OK") return null;
  return Number(element.distance.value) / 1000;
}

export async function quoteDelivery(customerLat: number, customerLng: number, address = "") {
  const restaurantLat = Number(process.env.RESTAURANT_LAT);
  const restaurantLng = Number(process.env.RESTAURANT_LNG);

  if (Number.isNaN(restaurantLat) || Number.isNaN(restaurantLng)) {
    throw new Error("Restaurant location is not configured");
  }

  let distanceKm: number | null = null;
  const origin = `${restaurantLat},${restaurantLng}`;
  const destination = !Number.isNaN(customerLat) && !Number.isNaN(customerLng)
    ? `${customerLat},${customerLng}`
    : address;

  if (destination) {
    distanceKm = await roadDistanceKm(origin, destination);
  }

  if (distanceKm == null && !Number.isNaN(customerLat) && !Number.isNaN(customerLng)) {
    distanceKm = haversineKm(restaurantLat, restaurantLng, customerLat, customerLng);
  }

  if (distanceKm == null) {
    throw new Error("Unable to calculate delivery distance");
  }

  const quote = feeForKm(distanceKm);
  return { ...quote, distanceKm: Number(distanceKm.toFixed(2)) };
}

router.post("/delivery/quote", async (req, res, next) => {
  try {
    const quote = await quoteDelivery(
      Number(req.body.customerLat),
      Number(req.body.customerLng),
      String(req.body.address || ""),
    );
    res.json(quote);
  } catch (err) {
    next(err);
  }
});

export default router;
