import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { subscribeToOrders, updateOrderStatus } from "@/lib/orderService";
import { useAuth } from "@/context/AuthContext";
import OrderCard from "@/components/OrderCard";
import { formatCurrency, statusLabel } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const STATUS_FILTERS: (OrderStatus | "all")[] = ["all", "placed", "accepted", "preparing", "ready", "out_for_delivery", "delivered", "completed", "cancelled"];

export default function OrdersManagement() {
  const { isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    const unsub = subscribeToOrders(setOrders);
    return unsub;
  }, [isAdmin]);

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSearch = o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  async function handleAction(orderId: string, status: OrderStatus) {
    const o = orders.find((x) => x.id === orderId);
    await updateOrderStatus(orderId, status, o?.customerId);
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-6 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-extrabold">All Orders</h1>
          <p className="text-white/70 text-sm mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or order #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as OrderStatus | "all")}
            className="border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === "all" ? "All Statuses" : statusLabel(s)}</option>)}
          </select>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Revenue", value: formatCurrency(orders.filter(o => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0)) },
            { label: "Showing", value: filtered.length },
            { label: "Completed", value: orders.filter(o => o.status === "completed").length },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl px-4 py-3 text-center">
              <p className="text-lg font-black text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Orders */}
        <div className="space-y-3">
          {filtered.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              actions={
                o.status === "placed" ? [{ label: "Accept", status: "accepted" as OrderStatus }, { label: "Cancel", status: "cancelled" as OrderStatus }] :
                o.status === "accepted" ? [{ label: "Preparing", status: "preparing" as OrderStatus }] :
                o.status === "preparing" ? [{ label: "Ready", status: "ready" as OrderStatus }] :
                o.status === "ready" && o.type !== "delivery" ? [{ label: "Complete", status: "completed" as OrderStatus }] :
                o.status === "out_for_delivery" ? [{ label: "Mark Delivered", status: "delivered" as OrderStatus }] :
                []
              }
              onAction={handleAction}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-center py-16 text-muted-foreground">No orders found</p>
          )}
        </div>
      </div>
    </div>
  );
}
