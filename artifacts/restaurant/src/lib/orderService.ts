import type { Order, OrderStatus } from "@/types";
import { addItem, getList, nowIso, subscribeList, updateItem } from "@/lib/rtdb";
import { awardLoyaltyStamp } from "@/lib/loyaltyService";

function generateOrderNumber() {
  return "ORD" + Date.now().toString().slice(-6);
}

function sortOrders(orders: Order[], direction: "asc" | "desc" = "desc") {
  return [...orders].sort((a, b) => {
    const result = String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
    return direction === "asc" ? result : -result;
  });
}

export async function createOrder(data: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">) {
  const now = nowIso();
  return addItem("orders", {
    ...data,
    orderNumber: generateOrderNumber(),
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus, customerId?: string) {
  await updateItem(`orders/${id}`, { status, updatedAt: nowIso() });
  if (status === "completed" && customerId) {
    await awardLoyaltyStamp(customerId, id);
  }
}

export function subscribeToOrders(cb: (orders: Order[]) => void) {
  return subscribeList<Order>("orders", (orders) => cb(sortOrders(orders)));
}

export function subscribeToMyOrders(uid: string, cb: (orders: Order[]) => void) {
  return subscribeList<Order>("orders", (orders) =>
    cb(sortOrders(orders.filter((order) => order.customerId === uid))),
  );
}

export function subscribeToKitchenOrders(cb: (orders: Order[]) => void) {
  const active = ["placed", "accepted", "preparing", "ready"];
  return subscribeList<Order>("orders", (orders) =>
    cb(sortOrders(orders.filter((order) => active.includes(order.status)), "asc")),
  );
}

export function subscribeToDeliveryOrders(cb: (orders: Order[]) => void) {
  const active = ["ready", "out_for_delivery"];
  return subscribeList<Order>("orders", (orders) =>
    cb(sortOrders(orders.filter((order) => order.type === "delivery" && active.includes(order.status)), "asc")),
  );
}

export async function getTodayOrders(): Promise<Order[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startTime = start.getTime();
  const orders = await getList<Order>("orders");
  return sortOrders(orders.filter((order) => new Date(order.createdAt || 0).getTime() >= startTime));
}
