import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getList } from "@/lib/rtdb";
import type { Reward } from "@/types";

export default function RewardsManagement() {
  const { isAdmin } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    getList<Reward>("rewards").then((items) =>
      setRewards(items.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))),
    );
  }, [isAdmin]);

  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center">Admin access required.</div>;

  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="bg-gradient-to-r from-amber-700 to-orange-700 text-white px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Gift className="w-6 h-6" />
          <div>
            <h1 className="text-2xl font-black">Reward Management</h1>
            <p className="text-white/70 text-sm">Issued and redeemed vouchers</p>
          </div>
        </div>
      </header>
      <section className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Customer", "Voucher", "Status"].map((h) => <th key={h} className="text-left px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rewards.map((reward) => (
                <tr key={reward.id}>
                  <td className="px-4 py-3 font-mono">{reward.customerId}</td>
                  <td className="px-4 py-3">{reward.voucherName}</td>
                  <td className="px-4 py-3">{reward.used ? "Used" : "Available"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rewards.length === 0 && <p className="text-center py-10 text-muted-foreground">No rewards issued yet.</p>}
        </div>
      </section>
    </main>
  );
}
