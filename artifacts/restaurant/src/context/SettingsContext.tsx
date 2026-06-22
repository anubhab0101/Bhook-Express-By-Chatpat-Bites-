import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { RestaurantSettings } from "@/types";
import { getItem, setItem, subscribeList } from "@/lib/rtdb";

const DEFAULT_SETTINGS: RestaurantSettings = {
  name: "Bhookh Express By (Chatpata Bites)",
  logo: "/logo.png",
  phone: "",
  email: "",
  address: "",
  tagline: "Taste the Tradition",
  setupComplete: false,
};

interface SettingsContextType {
  settings: RestaurantSettings;
  updateSettings: (data: Partial<RestaurantSettings>) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeList<RestaurantSettings>("settings", async () => {
      const data = await getItem<RestaurantSettings>("settings/restaurant");
      if (data) setSettings(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function updateSettings(data: Partial<RestaurantSettings>) {
    await setItem("settings/restaurant", { ...settings, ...data });
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
