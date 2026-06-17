import { getItem, nowIso, updateItem, addItem } from "@/lib/rtdb";

const FREE_MEALS = ["Veg Biryani", "Chicken Roll", "Paneer Tikka", "Dal Makhani", "Veg Fried Rice"];

export async function awardLoyaltyStamp(uid: string, orderId: string) {
  const user = await getItem<any>(`users/${uid}`);
  const order = await getItem<any>(`orders/${orderId}`);
  if (!user || !order || Number(order.total || 0) < 100) return;

  const stamps = Number(user.loyaltyStamps || 0) + 1;
  const rewardAvailable = stamps >= 10;

  await updateItem(`users/${uid}`, {
    loyaltyStamps: rewardAvailable ? 0 : stamps,
    rewardAvailable: rewardAvailable || Boolean(user.rewardAvailable),
    totalOrders: Number(user.totalOrders || 0) + 1,
    totalSpent: Number(user.totalSpent || 0) + Number(order.total || 0),
  });

  if (rewardAvailable) {
    const voucherName = FREE_MEALS[Math.floor(Math.random() * FREE_MEALS.length)];
    await addItem("rewards", {
      customerId: uid,
      voucherName,
      used: false,
      createdAt: nowIso(),
    });
  }
}

export async function useReward(uid: string, rewardId: string) {
  await updateItem(`rewards/${rewardId}`, { used: true, usedAt: nowIso() });
  await updateItem(`users/${uid}`, { rewardAvailable: false });
}
