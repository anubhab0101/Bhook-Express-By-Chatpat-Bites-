import type { Order } from "@/types";

type OnlineOrderPayload = Omit<
  Order,
  "id" | "orderNumber" | "createdAt" | "updatedAt" | "paymentStatus" | "paymentMethod" | "items"
> & {
  items: Array<{
    menuItem: { id: string };
    quantity: number;
  }>;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function apiUrl(path: string) {
  return `${import.meta.env.VITE_API_BASE_URL || ""}${path}`;
}

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export async function payWithRazorpay(orderPayload: OnlineOrderPayload, restaurantName: string) {
  await loadRazorpayScript();

  const createResponse = await fetch(apiUrl("/api/payments/create-razorpay-order"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderPayload }),
  });

  if (!createResponse.ok) {
    throw new Error((await createResponse.json()).error || "Unable to start payment");
  }

  const createData = await createResponse.json();

  return new Promise<{ orderId: string; orderNumber: string }>((resolve, reject) => {
    const checkout = new window.Razorpay!({
      key: createData.keyId,
      amount: createData.amount,
      currency: createData.currency,
      name: restaurantName || "Restaurant",
      description: "Food order payment",
      order_id: createData.razorpayOrderId,
      prefill: {
        name: orderPayload.customerName,
        contact: orderPayload.customerPhone,
      },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
      },
      handler: async (response: any) => {
        try {
          const verifyResponse = await fetch(apiUrl("/api/payments/verify-and-create-order"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderPayload,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentMethod: "razorpay",
            }),
          });

          if (!verifyResponse.ok) {
            throw new Error((await verifyResponse.json()).error || "Payment verification failed");
          }

          resolve(await verifyResponse.json());
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });

    checkout.open();
  });
}
