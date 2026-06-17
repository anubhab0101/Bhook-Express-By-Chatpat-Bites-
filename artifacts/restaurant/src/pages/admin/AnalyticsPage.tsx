import { useEffect, useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "@/context/AuthContext";
import { getList } from "@/lib/rtdb";
import type { Order } from "@/types";

export default function AnalyticsPage() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    getList<Order>("orders").then((items) => setOrders(items));
  }, [isAdmin]);

  const dailyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((order) => {
      const raw = new Date(order.createdAt || Date.now());
      const key = raw.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      map.set(key, (map.get(key) || 0) + (order.paymentStatus === "paid" ? order.total : 0));
    });
    return Array.from(map.entries()).slice(0, 14).reverse().map(([date, revenue]) => ({ date, revenue }));
  }, [orders]);

  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center">Admin access required.</div>;

  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <BarChart3 className="w-6 h-6" />
          <div>
            <h1 className="text-2xl font-black">Analytics</h1>
            <p className="text-white/70 text-sm">Revenue, orders, and growth snapshots</p>
          </div>
        </div>
      </header>
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold text-foreground mb-4">Daily Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}
