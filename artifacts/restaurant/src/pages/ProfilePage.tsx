import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { User, LogOut, Star, ShoppingBag, Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";

export default function ProfilePage() {
  const { user, signOut, isAdmin, isKitchen, isDelivery } = useAuth();
  const [, navigate] = useLocation();

  if (!user) {
    navigate("/login");
    return null;
  }

  const roleLabel: Record<string, string> = {
    admin: "Admin",
    manager: "Manager",
    kitchen: "Kitchen Staff",
    delivery: "Delivery Agent",
    customer: "Customer",
  };

  const roleBadgeColor: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    manager: "bg-blue-100 text-blue-700",
    kitchen: "bg-orange-100 text-orange-700",
    delivery: "bg-purple-100 text-purple-700",
    customer: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold">{user.name}</h1>
          <p className="text-white/60 text-sm mt-1">{user.email || user.phone}</p>
          <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${roleBadgeColor[user.role] || "bg-gray-100 text-gray-700"}`}>
            {roleLabel[user.role] || user.role}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
          {[
            { icon: ShoppingBag, label: "Orders", value: user.totalOrders || 0 },
            { icon: Star, label: "Stamps", value: `${user.loyaltyStamps || 0}/10` },
            { icon: Crown, label: "Spent", value: formatCurrency(user.totalSpent || 0) },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
              <s.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-black text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Nav links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {[
            { label: "My Orders", path: "/orders" },
            { label: "Loyalty Rewards", path: "/loyalty" },
            ...(isKitchen ? [{ label: "Kitchen Dashboard", path: "/kitchen" }] : []),
            ...(isDelivery ? [{ label: "Delivery Dashboard", path: "/delivery" }] : []),
            ...(isAdmin ? [{ label: "Admin Panel", path: "/admin" }] : []),
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full text-left px-5 py-4 text-foreground hover:bg-muted transition-colors flex items-center justify-between"
            >
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">→</span>
            </button>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={async () => { await signOut(); navigate("/"); }}
          className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive py-3.5 rounded-2xl font-semibold hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </motion.button>
      </div>
    </div>
  );
}
