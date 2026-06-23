import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSettings } from "@/context/SettingsContext";

// Fix leaflet default icons for Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createPinIcon = (color: string) => new L.DivIcon({
  className: "bg-transparent",
  html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const ICONS = {
  restaurant: createPinIcon("#f97316"), // orange
  customer: createPinIcon("#3b82f6"), // blue
  delivery: createPinIcon("#a855f7"), // purple
};

interface Loc { lat: number; lng: number }

interface LiveMapProps {
  restaurantLoc?: Loc | null;
  customerLoc?: Loc | null;
  deliveryBoyLoc?: Loc | null;
}

function MapUpdater({ locations }: { locations: (Loc | null | undefined)[] }) {
  const map = useMap();
  useEffect(() => {
    const validLocs = locations.filter(Boolean) as Loc[];
    if (validLocs.length > 0) {
      if (validLocs.length === 1) {
        map.setView([validLocs[0].lat, validLocs[0].lng], 15);
      } else {
        const bounds = L.latLngBounds(validLocs.map(l => [l.lat, l.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }
    }
  }, [locations, map]);
  return null;
}

export default function LiveMap({ restaurantLoc, customerLoc, deliveryBoyLoc }: LiveMapProps) {
  const { settings } = useSettings();
  
  const rLoc = restaurantLoc || { lat: 20.4023125, lng: 85.9519375 }; // Default fallback

  const center = deliveryBoyLoc || customerLoc || rLoc;

  return (
    <div className="h-48 sm:h-64 w-full rounded-xl overflow-hidden border border-border z-0 relative isolate">
      <MapContainer center={[center.lat, center.lng]} zoom={13} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapUpdater locations={[rLoc, customerLoc, deliveryBoyLoc]} />

        <Marker position={[rLoc.lat, rLoc.lng]} icon={ICONS.restaurant}>
          <Popup><strong>Restaurant</strong><br/>{settings?.address || "Bhookh Express"}</Popup>
        </Marker>
        
        {customerLoc && (
          <Marker position={[customerLoc.lat, customerLoc.lng]} icon={ICONS.customer}>
            <Popup><strong>Drop Location</strong></Popup>
          </Marker>
        )}
        
        {deliveryBoyLoc && (
          <Marker position={[deliveryBoyLoc.lat, deliveryBoyLoc.lng]} icon={ICONS.delivery}>
            <Popup><strong>Delivery Agent (Live)</strong></Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
