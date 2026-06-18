import { Router } from "express";
import crypto from "node:crypto";
import { getAdminDb } from "../lib/firebaseAdmin";
import { quoteDelivery } from "./delivery";

const router = Router();

type ClientCartItem = {
  menuItem: { id: string; name?: string; price?: number };
  quantity: number;
};

type OrderPayload = {
  type: "dine_in" | "delivery";
  items: ClientCartItem[];
  customerId: string;
  customerName: string;
  customerPhone: string;
  tableNumber?: string;
  deliveryAddress?: unknown;
  rewardApplied?: boolean;
  notes?: string;
};

function requireRazorpayEnv() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured");
  }
  return { keyId, keySecret };
}

async function priceOrder(payload: OrderPayload) {
  const db = getAdminDb();
  const pricedItems = [];
  let subtotal = 0;

  for (const cartItem of payload.items || []) {
    const quantity = Number(cartItem.quantity || 0);
    if (!cartItem.menuItem?.id || quantity <= 0) {
      throw new Error("Invalid cart item");
    }

    const snap = await db.ref(`menu/${cartItem.menuItem.id}`).get();
    if (!snap.exists()) {
      throw new Error(`Menu item ${cartItem.menuItem.id} not found`);
    }

    const menuItem = { id: cartItem.menuItem.id, ...snap.val() } as any;
    if (menuItem.available === false) {
      throw new Error(`${menuItem.name || "Menu item"} is unavailable`);
    }

    subtotal += Number(menuItem.price || 0) * quantity;
    pricedItems.push({ menuItem, quantity });
  }

  const tax = 0;
  let deliveryCharge = 0;
  if (payload.type === "delivery") {
    const deliveryAddress = payload.deliveryAddress as any;
    const quote = await quoteDelivery(
      Number(deliveryAddress?.lat),
      Number(deliveryAddress?.lng),
      `${deliveryAddress?.address || ""} ${deliveryAddress?.landmark || ""} ${deliveryAddress?.pincode || ""}`,
    );
    if (!quote.deliverable) {
      throw new Error("Delivery address is outside the 10 km delivery limit");
    }
    deliveryCharge = quote.deliveryCharge;
  }
  const total = subtotal + tax + deliveryCharge;
  return { items: pricedItems, subtotal, tax, deliveryCharge, total };
}

async function createRazorpayOrder(amountPaise: number, receipt: string) {
  const { keyId, keySecret } = requireRazorpayEnv();
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      payment_capture: 1,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Razorpay order failed: ${text}`);
  }

  return response.json() as Promise<{ id: string; amount: number; currency: string }>;
}

function verifySignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
  const { keySecret } = requireRazorpayEnv();
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

router.post("/payments/create-razorpay-order", async (req, res, next) => {
  try {
    const payload = req.body.orderPayload as OrderPayload;
    const priced = await priceOrder(payload);
    const razorpayOrder = await createRazorpayOrder(
      priced.total * 100,
      `order_${Date.now()}`,
    );

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/payments/verify-and-create-order", async (req, res, next) => {
  try {
    const {
      orderPayload,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod,
    } = req.body as {
      orderPayload: OrderPayload;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      paymentMethod?: string;
    };

    if (!verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      res.status(400).json({ error: "Invalid Razorpay signature" });
      return;
    }

    const priced = await priceOrder(orderPayload);
    const db = getAdminDb();
    const now = new Date().toISOString();
    const orderNumber = `ORD${Date.now().toString().slice(-6)}`;

    const orderRef = db.ref("orders").push();
    await orderRef.set({
      ...orderPayload,
      ...priced,
      orderNumber,
      status: "placed",
      paymentStatus: "paid",
      paymentMethod: paymentMethod || "razorpay",
      razorpayOrderId,
      razorpayPaymentId,
      rewardApplied: Boolean(orderPayload.rewardApplied),
      createdAt: now,
      updatedAt: now,
    });

    await db.ref("payments").push({
      paymentId: razorpayPaymentId,
      customerId: orderPayload.customerId,
      orderId: orderRef.key,
      amount: priced.total,
      currency: "INR",
      status: "Paid",
      paymentMethod: paymentMethod || "razorpay",
      razorpayOrderId,
      razorpayPaymentId,
      createdAt: now,
    });

    res.json({ orderId: orderRef.key, orderNumber });
  } catch (err) {
    next(err);
  }
});

export default router;
