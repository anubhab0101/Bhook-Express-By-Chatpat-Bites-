import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { subscribeToKitchenOrders } from "@/lib/orderService";

export function playLoudBeepSequence() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playBeep = (time: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "square"; // Very loud, harsh alarm sound
      osc.frequency.setValueAtTime(880, ctx.currentTime + time); // High pitch (A5)
      
      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.1);
      
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + 0.12);
    };

    // Play 5 fast beeps, repeat 3 times (5 baar lagatar, 3 bar)
    let time = 0;
    for (let burst = 0; burst < 3; burst++) {
      for (let beep = 0; beep < 5; beep++) {
        playBeep(time);
        time += 0.15; // 150ms gap between rapid beeps
      }
      time += 0.6; // 600ms gap between bursts
    }
  } catch(e) {
    console.error("Audio beep failed", e);
  }
}

export default function GlobalNotification() {
  const { user, isKitchen, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const prevIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!user || (!isKitchen && !isAdmin)) return;

    const unsub = subscribeToKitchenOrders((incoming) => {
      const placedOrders = incoming.filter(o => o.status === "placed");
      
      if (isFirstLoad.current) {
        placedOrders.forEach(o => prevIds.current.add(o.id));
        isFirstLoad.current = false;
        return;
      }
      
      const newOrders = placedOrders.filter(o => !prevIds.current.has(o.id));
      if (newOrders.length > 0) {
        // Play the loud alarm
        playLoudBeepSequence();
        
        // Auto navigate to Kitchen dashboard so they can accept it immediately
        if (!window.location.pathname.includes("/kitchen")) {
          navigate("/kitchen");
        }
        
        newOrders.forEach(o => prevIds.current.add(o.id));
      }
    });

    return unsub;
  }, [user, isKitchen, isAdmin, navigate]);

  return null;
}
