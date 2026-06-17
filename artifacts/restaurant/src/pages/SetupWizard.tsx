import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { MENU_CATEGORIES } from "@/types";

const STEPS = [
  "Restaurant",
  "Logo",
  "Razorpay",
  "SMSGateway",
  "Delivery",
  "Categories",
  "Menu",
  "QR Codes",
  "Go Live",
];

export default function SetupWizard() {
  const { isAdmin } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...settings });
  const [saving, setSaving] = useState(false);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Admin access is required for setup.
      </div>
    );
  }

  async function next() {
    setSaving(true);
    await updateSettings(form);
    setSaving(false);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      await updateSettings({ ...form, setupComplete: true });
      navigate("/admin");
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-foreground mb-2">Setup Wizard</h1>
        <p className="text-muted-foreground mb-6">Complete the operational settings before going live.</p>

        <div className="flex gap-2 overflow-x-auto mb-6">
          {STEPS.map((label, index) => (
            <button
              key={label}
              onClick={() => setStep(index)}
              className={`px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap ${
                index === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}. {label}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">{STEPS[step]}</h2>

          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {["name", "tagline", "phone", "email", "address"].map((key) => (
                <input
                  key={key}
                  placeholder={key}
                  value={(form as any)[key] || ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="border border-border rounded-xl px-3 py-2 bg-background"
                />
              ))}
            </div>
          )}

          {step === 1 && (
            <input
              placeholder="Logo URL"
              value={form.logo || ""}
              onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))}
              className="w-full border border-border rounded-xl px-3 py-2 bg-background"
            />
          )}

          {step === 2 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {["razorpayKeyId", "razorpayKeySecret"].map((key) => (
                <input key={key} placeholder={key} type="password" className="border border-border rounded-xl px-3 py-2 bg-background" />
              ))}
              <p className="sm:col-span-2 text-xs text-muted-foreground">Razorpay secrets must also be added to server environment variables before deployment.</p>
            </div>
          )}

          {step === 3 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {["smsgwUsername", "smsgwPassword", "smsgwApiKey", "smsgwDeviceId", "smsgwSenderId"].map((key) => (
                <input
                  key={key}
                  placeholder={key}
                  value={(form as any)[key] || ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="border border-border rounded-xl px-3 py-2 bg-background"
                />
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="grid sm:grid-cols-3 gap-4">
              {["0-2 KM = Rs 15", "2-5 KM = Rs 30", "5-10 KM = Rs 50", "10+ KM = Not Deliverable"].map((rule) => (
                <div key={rule} className="border border-border rounded-xl p-4 font-semibold text-foreground">{rule}</div>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-wrap gap-2">
              {MENU_CATEGORIES.map((category) => (
                <span key={category} className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm font-semibold">{category}</span>
              ))}
            </div>
          )}

          {step === 6 && <p className="text-muted-foreground">Add the first menu items from Admin &gt; Menu after finishing setup.</p>}
          {step === 7 && <p className="text-muted-foreground">Generate general and table QR codes from Admin &gt; QR Codes.</p>}
          {step === 8 && <p className="text-muted-foreground">Review settings, test a COD order, test a Razorpay payment, then go live.</p>}

          <div className="flex justify-between pt-4">
            <button disabled={step === 0} onClick={() => setStep(step - 1)} className="px-4 py-2 rounded-xl border border-border disabled:opacity-50">Back</button>
            <button onClick={next} disabled={saving} className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold">
              {saving ? "Saving..." : step === STEPS.length - 1 ? "Go Live" : "Save & Continue"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
