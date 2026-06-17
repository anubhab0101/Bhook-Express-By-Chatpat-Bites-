import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, X, Upload, ToggleLeft, ToggleRight } from "lucide-react";
import { subscribeToMenu, addMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/menuService";
import { uploadMenuImage } from "@/lib/storageService";
import { OFFLINE_MENU_ITEMS } from "@/lib/offlineMenu";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { formatCurrency } from "@/lib/utils";
import type { MenuItem, MenuCategory } from "@/types";
import { MENU_CATEGORIES } from "@/types";

const EMPTY: Omit<MenuItem, "id" | "createdAt"> = {
  name: "", description: "", price: 0, image: "", category: "Starters", available: true, featured: false,
};

export default function MenuManagement() {
  const { isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState<MenuCategory | "All">("All");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    const unsub = subscribeToMenu(setItems);
    return unsub;
  }, [isAdmin]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMenuImage(file, file.name);
      setForm((f) => ({ ...f, image: url }));
    } catch (err: any) {
      alert(err.message || "Image upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      if (editing) {
        await updateMenuItem(editing, form);
      } else {
        await addMenuItem(form);
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await deleteMenuItem(id);
  }

  async function seedOfflineMenu() {
    if (!confirm("Add the offline restaurant menu items? Existing items will not be removed.")) return;
    setSaving(true);
    try {
      for (const seed of OFFLINE_MENU_ITEMS) {
        await addMenuItem(seed);
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(item: MenuItem) {
    await updateMenuItem(item.id, { available: !item.available });
  }

  function startEdit(item: MenuItem) {
    setForm({ name: item.name, description: item.description, price: item.price, image: item.image, category: item.category, available: item.available, featured: item.featured });
    setEditing(item.id);
    setShowForm(true);
  }

  function resetForm() {
    setForm({ ...EMPTY });
    setEditing(null);
    setShowForm(false);
  }

  const filtered = items.filter((i) => filterCat === "All" || i.category === filterCat);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="bg-gradient-to-r from-amber-700 to-orange-700 text-white py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Menu Management</h1>
            <p className="text-white/70 text-sm">{items.length} items</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-white text-amber-700 font-bold px-4 py-2 rounded-xl hover:bg-amber-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
          <button
            onClick={seedOfflineMenu}
            disabled={saving}
            className="flex items-center gap-2 bg-amber-100 text-amber-800 font-bold px-4 py-2 rounded-xl hover:bg-amber-200 disabled:opacity-60 transition-colors"
          >
            Seed Menu
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {(["All", ...MENU_CATEGORIES] as (MenuCategory | "All")[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                filterCat === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((item) => (
              <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`bg-card border rounded-2xl overflow-hidden shadow-sm ${!item.available ? "opacity-60" : ""}`}>
                <div className="relative h-36 bg-muted">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>}
                  {item.featured && <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Featured</span>}
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <p className="font-bold text-primary text-sm whitespace-nowrap">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => toggleAvailability(item)} className="text-muted-foreground hover:text-primary transition-colors">
                      {item.available ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <span className="text-xs text-muted-foreground">{item.available ? "Available" : "Unavailable"}</span>
                    <div className="ml-auto flex gap-1">
                      <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
              className="bg-card w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">{editing ? "Edit Item" : "Add New Item"}</h2>
                <button onClick={resetForm} className="p-2 rounded-xl hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                {/* Image */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Image</label>
                  <div className="flex items-center gap-3">
                    {form.image && <img src={form.image} alt="" className="w-16 h-16 rounded-xl object-cover" />}
                    <button onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="flex items-center gap-2 border border-dashed border-border px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-60">
                      <Upload className="w-4 h-4" />
                      {uploading ? "Uploading..." : "Upload Image"}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>
                </div>

                {[
                  { key: "name", label: "Name", type: "text", placeholder: "e.g. Chicken Biryani" },
                  { key: "description", label: "Description", type: "text", placeholder: "Short description" },
                  { key: "price", label: "Price (₹)", type: "number", placeholder: "0" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-sm font-medium text-foreground block mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={(form as any)[f.key]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                      className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as MenuCategory }))}
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {MENU_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex gap-4">
                  {[["available", "Available"], ["featured", "Featured"]].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(form as any)[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.price}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {saving ? "Saving..." : editing ? "Update Item" : "Add Item"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
