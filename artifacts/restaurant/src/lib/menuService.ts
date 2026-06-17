import type { MenuItem } from "@/types";
import { addItem, deleteItem, getList, nowIso, sortByField, subscribeList, updateItem } from "@/lib/rtdb";
import { OFFLINE_MENU_ITEMS } from "@/lib/offlineMenu";

export function subscribeToMenu(cb: (items: MenuItem[]) => void) {
  return subscribeList<MenuItem>("menu", (items) => cb(sortByField(items, "category")));
}

export async function getMenu(): Promise<MenuItem[]> {
  return sortByField(await getList<MenuItem>("menu"), "category");
}

export async function addMenuItem(data: Omit<MenuItem, "id" | "createdAt">) {
  return addItem("menu", { ...data, createdAt: nowIso() });
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>) {
  return updateItem(`menu/${id}`, data as Record<string, unknown>);
}

export async function deleteMenuItem(id: string) {
  return deleteItem(`menu/${id}`);
}

export async function ensureMenuSeeded() {
  const existing = await getMenu();
  if (existing.length > 0) return existing;

  for (const seed of OFFLINE_MENU_ITEMS) {
    await addMenuItem(seed);
  }

  return getMenu();
}
