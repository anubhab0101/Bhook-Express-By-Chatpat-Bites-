import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Star, MapPin, Phone, Clock, QrCode, Truck, UtensilsCrossed, Award } from "lucide-react";
import { subscribeToMenu } from "@/lib/menuService";
import { useSettings } from "@/context/SettingsContext";
import MenuCard from "@/components/MenuCard";
import type { MenuItem } from "@/types";

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const testimonials = [
  { name: "Priya Sharma", text: "Absolutely loved the biryani! The QR ordering is so convenient.", rating: 5 },
  { name: "Rahul Gupta", text: "Fast delivery and the food arrived piping hot. Will order again!", rating: 5 },
  { name: "Ananya Das", text: "The loyalty rewards program is a great touch. Amazing food quality.", rating: 5 },
];

export default function LandingPage() {
  const { settings } = useSettings();
  const [featured, setFeatured] = useState<MenuItem[]>([]);

  useEffect(() => {
    const unsub = subscribeToMenu((items) => {
      setFeatured(items.filter((i) => i.featured && i.available).slice(0, 6));
    });
    return unsub;
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-950 via-amber-900 to-orange-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        >
          <motion.p variants={fadeUp} className="text-amber-300 text-sm font-semibold uppercase tracking-widest mb-4">
            Welcome to
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
            {settings.name || "Our Restaurant"}
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-white/80 mb-8">
            {settings.tagline || "Taste the Tradition"}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/menu"
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-full text-lg transition-all shadow-lg hover:shadow-amber-500/40 hover:scale-105"
            >
              Order Now
            </Link>
            <Link
              href="/menu"
              className="border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 rounded-full text-lg transition-all hover:bg-white/10"
            >
              View Menu
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm flex flex-col items-center gap-1"
        >
          <span>Scroll</span>
          <div className="w-0.5 h-6 bg-white/40 rounded-full" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: QrCode, title: "QR Menu Ordering", desc: "Scan the table QR and order instantly — no app needed.", color: "text-amber-500" },
              { icon: Truck, title: "Home Delivery", desc: "Fresh food delivered to your doorstep within 45 minutes.", color: "text-orange-500" },
              { icon: Award, title: "Loyalty Rewards", desc: "Earn stamps with every order. Unlock a free meal every 10 orders!", color: "text-emerald-500" },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
                <f.icon className={`w-10 h-10 mx-auto mb-4 ${f.color}`} />
                <h3 className="text-xl font-bold mb-2 text-foreground">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Foods */}
      {featured.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
              <p className="text-amber-500 font-semibold uppercase tracking-widest text-sm mb-2">Our Best</p>
              <h2 className="text-4xl font-extrabold text-foreground">Featured Dishes</h2>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featured.map((item) => (
                <motion.div key={item.id} variants={fadeUp}>
                  <MenuCard item={item} />
                </motion.div>
              ))}
            </motion.div>
            <div className="text-center mt-10">
              <Link
                href="/menu"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
              >
                View Full Menu
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Restaurant Story */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <p className="text-amber-500 font-semibold uppercase tracking-widest text-sm mb-2">Our Story</p>
              <h2 className="text-4xl font-extrabold text-foreground mb-6">Crafted with Passion</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                Every dish at {settings.name || "our restaurant"} is crafted with the finest ingredients, time-honored recipes, and a passion for bringing people together through food.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you dine in, order through our QR system, or get delivery — every meal is prepared fresh to order, because you deserve nothing less.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="rounded-3xl overflow-hidden h-72 bg-muted"
            >
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"
                alt="Restaurant kitchen"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* QR CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp}>
              <QrCode className="w-16 h-16 mx-auto mb-4 opacity-90" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl font-extrabold mb-4">
              Dine In? Scan &amp; Order
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-white/80 mb-8">
              Scan the QR code at your table to browse the menu and place your order instantly — no waiting for a waiter.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/menu"
                className="bg-white text-amber-700 font-bold px-8 py-4 rounded-full text-lg hover:shadow-xl transition-all hover:scale-105 inline-block"
              >
                Browse Menu Now
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <p className="text-amber-500 font-semibold uppercase tracking-widest text-sm mb-2">Reviews</p>
            <h2 className="text-4xl font-extrabold text-foreground">What Our Guests Say</h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{t.text}"</p>
                <p className="font-semibold text-foreground">{t.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-foreground">Find Us</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: MapPin, label: "Address", value: settings.address || "123 Main Street, City" },
              { icon: Phone, label: "Phone", value: settings.phone || "+91 98765 43210" },
              { icon: Clock, label: "Hours", value: "11 AM – 11 PM · Daily" },
            ].map((c) => (
              <div key={c.label} className="text-center p-6 rounded-2xl bg-card border border-border">
                <c.icon className="w-8 h-8 mx-auto mb-3 text-amber-500" />
                <p className="text-sm text-muted-foreground mb-1">{c.label}</p>
                <p className="font-semibold text-foreground">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-950 text-white/70 py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <UtensilsCrossed className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">{settings.name || "Restaurant"}</span>
        </div>
        <p>© {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </div>
  );
}
