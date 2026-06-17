import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getList } from "@/lib/rtdb";
import { formatCurrency } from "@/lib/utils";

type Payment = {
  id: string;
  paymentId: string;
  customerId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
};

export default function PaymentsPage() {
  const { isAdmin } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    getList<Payment>("payments").then((items) =>
      setPayments(items.sort((a: any, b: any) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))),
    );
  }, [isAdmin]);

  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center">Admin access required.</div>;

  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <CreditCard className="w-6 h-6" />
          <div>
            <h1 className="text-2xl font-black">Payments</h1>
            <p className="text-white/70 text-sm">Razorpay and COD payment records</p>
          </div>
        </div>
      </header>
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-card border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Payment", "Order", "Amount", "Method", "Status"].map((h) => <th key={h} className="text-left px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 font-mono">{payment.paymentId || payment.razorpayPaymentId}</td>
                  <td className="px-4 py-3 font-mono">{payment.orderId}</td>
                  <td className="px-4 py-3 font-bold">{formatCurrency(payment.amount || 0)}</td>
                  <td className="px-4 py-3">{payment.paymentMethod}</td>
                  <td className="px-4 py-3">{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && <p className="text-center py-10 text-muted-foreground">No payments recorded yet.</p>}
        </div>
      </section>
    </main>
  );
}
