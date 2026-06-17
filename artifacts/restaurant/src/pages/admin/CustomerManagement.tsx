import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Search, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { getList } from "@/lib/rtdb";
import type { User } from "@/types";

export default function CustomerManagement() {
  const { isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const [customers, setCustomers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    loadCustomers();
  }, [isAdmin]);

  async function loadCustomers() {
    const users = await getList<User>("users");
    setCustomers(users.map((user) => ({ ...user, uid: user.uid || user.id })).filter((user) => user.role === "customer"));
    setLoading(false);
  }

  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="bg-gradient-to-r from-purple-700 to-violet-700 text-white py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Users className="w-6 h-6" />
          <div>
            <h1 className="text-2xl font-extrabold">Customers</h1>
            <p className="text-white/70 text-sm">{customers.length} registered</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Name", "Contact", "Orders", "Spent", "Stamps", "Reward"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.uid} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{c.name}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{c.email}</p>
                    <p>{c.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{c.totalOrders || 0}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(c.totalSpent || 0)}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-amber-500">{c.loyaltyStamps || 0}/10</span>
                  </td>
                  <td className="px-4 py-3">
                    {c.rewardAvailable ? (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">Available</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <p className="text-center py-12 text-muted-foreground">No customers found</p>
          )}
        </div>
      </div>
    </div>
  );
}
