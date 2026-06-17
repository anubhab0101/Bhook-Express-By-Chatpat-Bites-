import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Award, Star, Gift, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useReward } from "@/lib/loyaltyService";
import { getList } from "@/lib/rtdb";
import type { Reward } from "@/types";

export default function LoyaltyPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [using, setUsing] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadRewards();
  }, [user]);

  async function loadRewards() {
    if (!user) return;
    const rewards = await getList<Reward>("rewards");
    setRewards(rewards.filter((reward) => reward.customerId === user.uid));
  }

  async function handleUseReward(id: string) {
    if (!user) return;
    setUsing(id);
    try {
      await useReward(user.uid, id);
      await loadRewards();
    } finally {
      setUsing(null);
    }
  }

  if (!user) return null;

  const stamps = user.loyaltyStamps || 0;
  const progress = (stamps / 10) * 100;
  const activeRewards = rewards.filter((r) => !r.used);
  const usedRewards = rewards.filter((r) => r.used);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="bg-gradient-to-br from-amber-600 to-orange-600 text-white py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h1 className="text-3xl font-extrabold">Loyalty Rewards</h1>
          <p className="text-white/80 mt-1">Earn stamps, unlock free meals</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Stamp Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground text-lg">Your Stamps</h2>
            <span className="text-2xl font-black text-amber-500">{stamps}/10</span>
          </div>

          {/* Stamp grid */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all ${
                  i < stamps
                    ? "bg-amber-500 shadow-md shadow-amber-200"
                    : "bg-muted border-2 border-dashed border-border"
                }`}
              >
                {i < stamps ? "⭐" : ""}
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2.5 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-amber-500 h-2.5 rounded-full"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {10 - stamps > 0 ? `${10 - stamps} more orders to earn a free meal!` : "You've earned a free meal!"}
          </p>

          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-primary">{user.totalOrders || 0}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
            <div>
              <p className="text-2xl font-black text-primary">₹{user.totalSpent || 0}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
          </div>
        </motion.div>

        {/* Active Rewards */}
        {user.rewardAvailable && activeRewards.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="font-bold text-foreground text-lg mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-500" />
              Available Rewards
            </h2>
            <div className="space-y-3">
              {activeRewards.map((r) => (
                <div key={r.id} className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-emerald-800 dark:text-emerald-300 text-lg">🎁 Free {r.voucherName}</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Single use · Next order over ₹100</p>
                  </div>
                  <button
                    onClick={() => handleUseReward(r.id)}
                    disabled={using === r.id}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors whitespace-nowrap"
                  >
                    {using === r.id ? "Applying..." : "Use Reward"}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Rules */}
        <div className="bg-muted/50 rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            How it works
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Place an order above ₹100 to earn 1 stamp",
              "Collect 10 stamps to unlock a free random meal",
              "Reward is valid on your next order above ₹100",
              "Each reward voucher is single-use only",
              "Stamps reset to 0 after every 10 qualifying orders",
            ].map((r) => (
              <li key={r} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* History */}
        {usedRewards.length > 0 && (
          <div>
            <h3 className="font-bold text-foreground mb-3 text-muted-foreground">Used Rewards</h3>
            <div className="space-y-2">
              {usedRewards.map((r) => (
                <div key={r.id} className="flex items-center gap-3 bg-muted/40 rounded-xl px-4 py-3 opacity-60">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground line-through">{r.voucherName}</span>
                  <span className="text-xs text-muted-foreground ml-auto">Used</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
