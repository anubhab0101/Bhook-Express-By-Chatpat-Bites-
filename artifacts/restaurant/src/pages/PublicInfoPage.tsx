import { useSettings } from "@/context/SettingsContext";

const CONTENT: Record<string, { title: string; body: string[] }> = {
  "/about": {
    title: "About Us",
    body: [
      "We serve fresh, made-to-order meals for dine-in, QR ordering, takeaway, and home delivery.",
      "Our restaurant platform keeps the menu, kitchen, delivery, rewards, and payments connected in real time.",
    ],
  },
  "/contact": {
    title: "Contact",
    body: ["Call, email, or visit us for reservations, bulk orders, catering, and support."],
  },
  "/privacy-policy": {
    title: "Privacy Policy",
    body: [
      "We collect only the information needed to create accounts, process orders, deliver food, issue rewards, and send order updates.",
      "Payment information is handled by Razorpay and is not stored directly by the restaurant application.",
    ],
  },
  "/terms": {
    title: "Terms",
    body: [
      "Orders are accepted subject to item availability, delivery coverage, payment confirmation, and restaurant operating hours.",
      "Rewards are single-use and valid on eligible orders above the configured minimum order value.",
    ],
  },
};

export default function PublicInfoPage() {
  const { settings } = useSettings();
  const content = CONTENT[window.location.pathname] || CONTENT["/about"];

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-amber-800 to-orange-800 text-white px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <p className="text-white/70 text-sm font-semibold mb-2">{settings.name || "Restaurant"}</p>
          <h1 className="text-4xl font-black">{content.title}</h1>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-4 py-10 space-y-5 text-muted-foreground leading-7">
        {content.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {window.location.pathname === "/contact" && (
          <div className="grid sm:grid-cols-3 gap-4 pt-4">
            <div className="border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-bold text-foreground">{settings.phone || "Configure in settings"}</p>
            </div>
            <div className="border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-bold text-foreground">{settings.email || "Configure in settings"}</p>
            </div>
            <div className="border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="font-bold text-foreground">{settings.address || "Configure in settings"}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
