import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Star, ShoppingBag, Crown, MapPin, Plus, Trash2, Edit2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { updateItem, deleteItem, nowIso } from "@/lib/rtdb";
import type { SavedAddress } from "@/types";

export default function ProfilePage() {
  const { user, signOut, isAdmin, isKitchen, isDelivery } = useAuth();
  const [, navigate] = useLocation();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Partial<SavedAddress>>({});

  if (!user) {
    navigate("/login");
    return null;
  }

  const savedAddressesList = Object.values(user.savedAddresses || {});

  async function saveAddress() {
    if (!addressForm.label || !addressForm.address || !addressForm.pincode) {
      alert("Please fill Label, Address and Pincode");
      return;
    }
    const id = editingAddressId || `addr_${Date.now()}`;
    const payload = {
      id,
      label: addressForm.label,
      name: addressForm.name || user?.name || "",
      phone: addressForm.phone || user?.phone || "",
      address: addressForm.address,
      landmark: addressForm.landmark || "",
      pincode: addressForm.pincode,
    };
    await updateItem(`users/${user?.uid}/savedAddresses/${id}`, payload);
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm({});
  }

  async function removeAddress(id: string) {
    if (confirm("Delete this address?")) {
      await deleteItem(`users/${user?.uid}/savedAddresses/${id}`);
    }
  }

  function editAddress(addr: SavedAddress) {
    setAddressForm(addr);
    setEditingAddressId(addr.id);
    setShowAddressForm(true);
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

        {/* Address Book */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl overflow-hidden p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Saved Addresses</h2>
            {!showAddressForm && (
              <button onClick={() => { setAddressForm({ label: "Home", name: user.name, phone: user.phone }); setEditingAddressId(null); setShowAddressForm(true); }} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-semibold hover:bg-primary/20 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add New
              </button>
            )}
          </div>

          <AnimatePresence>
            {showAddressForm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6 bg-muted/50 p-4 rounded-xl space-y-3 overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-sm">{editingAddressId ? "Edit Address" : "Add New Address"}</h3>
                  <button onClick={() => setShowAddressForm(false)} className="p-1 hover:bg-muted rounded-md"><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Label (Home, Office)" value={addressForm.label || ""} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:border-primary" />
                  <input type="text" placeholder="Pincode" value={addressForm.pincode || ""} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:border-primary" />
                </div>
                <input type="text" placeholder="Complete Address" value={addressForm.address || ""} onChange={e => setAddressForm({ ...addressForm, address: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:border-primary" />
                <input type="text" placeholder="Landmark (Optional)" value={addressForm.landmark || ""} onChange={e => setAddressForm({ ...addressForm, landmark: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:border-primary" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Receiver Name" value={addressForm.name || ""} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:border-primary" />
                  <input type="tel" placeholder="Receiver Phone" value={addressForm.phone || ""} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:border-primary" />
                </div>
                <button onClick={saveAddress} className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold text-sm mt-2">Save Address</button>
              </motion.div>
            )}
          </AnimatePresence>

          {!showAddressForm && savedAddressesList.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No saved addresses yet.</p>
          )}

          <div className="space-y-3">
            {!showAddressForm && savedAddressesList.map(addr => (
              <div key={addr.id} className="border border-border rounded-xl p-3 flex items-start justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-muted px-2 py-0.5 rounded text-xs font-bold text-foreground">{addr.label}</span>
                    <span className="text-sm font-semibold">{addr.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{addr.address}, {addr.landmark}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Ph: {addr.phone} • Pin: {addr.pincode}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => editAddress(addr)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => removeAddress(addr.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
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
