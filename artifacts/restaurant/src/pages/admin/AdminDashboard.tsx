import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  TrendingUp, ShoppingBag, Users, Clock,
  UtensilsCrossed, Star, Settings, QrCode, Package, Gift, CreditCard, BarChart3
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { formatCurrency, statusLabel } from "@/lib/utils";
import { getList } from "@/lib/rtdb";
import type { Order, MenuItem, User } from "@/types";

const COLORS = ["#f59e0b", "#f97316", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    loadData();
  }, [isAdmin]);

  async function loadData() {
    const start = new Date(); start.setHours(0,0,0,0);
    const [orders, menu, users] = await Promise.all([
      getList<Order>("orders"),
      getList<MenuItem>("menu"),
      getList<User>("users"),
    ]);
    setTodayOrders(orders.filter((order) => new Date(order.createdAt || 0) >= start).sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))));
    setMenuItems(menu.sort((a, b) => String(a.category || "").localeCompare(String(b.category || ""))));
    setCustomerCount(users.filter((user) => user.role === "customer").length);
    setLoading(false);
  }

  const revenue = todayOrders.filter(o => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);
  const pendingOrders = todayOrders.filter(o => ["placed","accepted","preparing","ready"].includes(o.status)).length;
  const completedOrders = todayOrders.filter(o => o.status === "completed").length;
  const avgOrder = completedOrders > 0 ? revenue / completedOrders : 0;

  // Category breakdown for pie chart
  const categoryData = menuItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  // Top items by frequency in orders
  const itemFreq: Record<string, { name: string; count: number }> = {};
  todayOrders.forEach((o) => {
    o.items?.forEach((ci) => {
      const key = ci.menuItem.id;
      itemFreq[key] = { name: ci.menuItem.name, count: (itemFreq[key]?.count || 0) + ci.quantity };
    });
  });
  const topItems = Object.values(itemFreq).sort((a, b) => b.count - a.count).slice(0, 5);

  const stats = [
    { icon: TrendingUp, label: "Today's Revenue", value: formatCurrency(revenue), color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { icon: ShoppingBag, label: "Today's Orders", value: todayOrders.length, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { icon: Clock, label: "Pending Orders", value: pendingOrders, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { icon: Users, label: "Customers", value: customerCount, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  ];

  const quickLinks = [
    { icon: UtensilsCrossed, label: "Menu", path: "/admin/menu", color: "bg-amber-500" },
    { icon: Package, label: "Orders", path: "/admin/orders", color: "bg-blue-500" },
    { icon: Users, label: "Customers", path: "/admin/customers", color: "bg-purple-500" },
    { icon: Gift, label: "Rewards", path: "/admin/rewards", color: "bg-pink-500" },
    { icon: CreditCard, label: "Payments", path: "/admin/payments", color: "bg-indigo-500" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics", color: "bg-teal-500" },
    { icon: QrCode, label: "QR Codes", path: "/admin/qr", color: "bg-emerald-500" },
    { icon: Settings, label: "Settings", path: "/admin/settings", color: "bg-slate-500" },
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
          <p className="text-white/60 text-sm mt-1">Today's snapshot · {new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-black text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickLinks.map((l) => (
            <Link key={l.path} href={l.path}>
              <a className="flex flex-col items-center gap-2 bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow group">
                <div className={`w-10 h-10 ${l.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <l.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-foreground">{l.label}</span>
              </a>
            </Link>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top items */}
          {topItems.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Top Selling Items (Today)
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topItems} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category pie */}
          {pieData.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-amber-500" />
                Menu by Category
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-foreground">Recent Orders</h2>
            <Link href="/admin/orders">
              <a className="text-sm text-primary font-medium hover:underline">View all</a>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["Order #", "Customer", "Type", "Total", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {todayOrders.slice(0, 8).map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-foreground">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-foreground">{o.customerName}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{o.type.replace("_", " ")}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        o.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        o.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{statusLabel(o.status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {todayOrders.length === 0 && (
              <p className="text-center py-8 text-muted-foreground text-sm">No orders today yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
