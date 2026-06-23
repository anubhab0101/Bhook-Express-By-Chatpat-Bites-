import { useState, useRef } from "react";
import { useEffect } from "react";
import { Settings, Upload, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useSettings } from "@/context/SettingsContext";
import { uploadLogoImage } from "@/lib/storageService";

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const { settings, updateSettings } = useSettings();
  const [form, setForm] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAdmin) navigate("/");
  }, [isAdmin]);

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  const [deliveryStaffPhones, setDeliveryStaffPhones] = useState<string[]>([]);
  const [newStaffPhone, setNewStaffPhone] = useState("");

  useEffect(() => {
    async function loadStaff() {
      const data = await import("@/lib/rtdb").then(m => m.getItem<Record<string, boolean>>("delivery_staff"));
      if (data) setDeliveryStaffPhones(Object.keys(data).filter(k => data[k]));
    }
    if (isAdmin) loadStaff();
  }, [isAdmin]);

  async function handleAddStaff() {
    if (!newStaffPhone || newStaffPhone.length < 10) return;
    const phone = newStaffPhone.replace(/\D/g, "").slice(-10);
    if (deliveryStaffPhones.includes(phone)) return;
    const updated = [...deliveryStaffPhones, phone];
    setDeliveryStaffPhones(updated);
    setNewStaffPhone("");
    const dbObj = updated.reduce((acc, curr) => ({ ...acc, [curr]: true }), {});
    await import("@/lib/rtdb").then(m => m.setItem("delivery_staff", dbObj));
  }

  async function handleRemoveStaff(phone: string) {
    const updated = deliveryStaffPhones.filter(p => p !== phone);
    setDeliveryStaffPhones(updated);
    const dbObj = updated.reduce((acc, curr) => ({ ...acc, [curr]: true }), {});
    await import("@/lib/rtdb").then(m => m.setItem("delivery_staff", dbObj));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadLogoImage(file);
      setForm((f) => ({ ...f, logo: url }));
    } finally {
      setUploading(false);
    }
  }

  const sections = [
    {
      title: "Restaurant Info",
      fields: [
        { key: "name", label: "Restaurant Name", placeholder: "Bhookh Express By (Chatpata Bites)" },
        { key: "tagline", label: "Tagline", placeholder: "Taste the Tradition" },
        { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
        { key: "email", label: "Email", placeholder: "info@restaurant.com" },
        { key: "address", label: "Address", placeholder: "123 Main St, City" },
      ],
    },
    {
      title: "Razorpay Payment Gateway",
      fields: [
        { key: "razorpayKeyId", label: "Key ID", placeholder: "rzp_test_xxxxx" },
        { key: "razorpayKeySecret", label: "Key Secret", placeholder: "••••••••" },
      ],
    },
    {
      title: "SMS Gateway",
      fields: [
        { key: "smsgwUsername", label: "Username", placeholder: "your_username" },
        { key: "smsgwApiKey", label: "API Key", placeholder: "••••••••" },
        { key: "smsgwDeviceId", label: "Device ID", placeholder: "DEVICE_ID" },
        { key: "smsgwSenderId", label: "Sender ID", placeholder: "RESTAU" },
      ],
    },
    {
      title: "SMTP Email (Optional)",
      fields: [
        { key: "smtpHost", label: "SMTP Host", placeholder: "smtp.gmail.com" },
        { key: "smtpPort", label: "SMTP Port", placeholder: "587" },
        { key: "smtpUser", label: "SMTP User", placeholder: "your@email.com" },
        { key: "smtpPassword", label: "SMTP Password", placeholder: "••••••••" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white py-6 px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Settings className="w-6 h-6" />
          <h1 className="text-2xl font-extrabold">Settings</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Logo */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold text-foreground mb-4">Logo</h2>
          <div className="flex items-center gap-4">
            {form.logo ? (
              <img src={form.logo} alt="Logo" className="w-20 h-20 rounded-2xl object-contain border border-border" />
            ) : (
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center text-3xl">🍽️</div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 border border-dashed border-border px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload Logo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h2 className="font-bold text-foreground">{section.title}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {section.fields.map((f) => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-foreground block mb-1">{f.label}</label>
                  <input
                    type={f.key.toLowerCase().includes("password") || f.key.toLowerCase().includes("key") ? "password" : "text"}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key] || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Manage Delivery Staff */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-foreground">Manage Delivery Staff</h2>
          <p className="text-sm text-muted-foreground">Add phone numbers (10 digits). They will automatically get the Delivery role upon logging in.</p>
          <div className="flex gap-3">
            <div className="flex bg-background border border-border rounded-xl px-3 py-2 text-sm flex-1">
              <span className="text-muted-foreground mr-2">+91</span>
              <input
                type="tel"
                placeholder="9876543210"
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="bg-transparent border-none outline-none flex-1"
              />
            </div>
            <button onClick={handleAddStaff} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold">
              Add
            </button>
          </div>
          <div className="space-y-2 mt-4">
            {deliveryStaffPhones.map(phone => (
              <div key={phone} className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-lg border border-border text-sm">
                <span>+91 {phone}</span>
                <button onClick={() => handleRemoveStaff(phone)} className="text-destructive font-bold text-xs">Remove</button>
              </div>
            ))}
            {deliveryStaffPhones.length === 0 && <p className="text-sm text-muted-foreground italic">No delivery staff added yet.</p>}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-2xl font-bold text-base hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
