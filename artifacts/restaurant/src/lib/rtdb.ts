import {
  get,
  off,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { db } from "@/lib/firebase";

export function nowIso() {
  return new Date().toISOString();
}

export function toList<T>(value: unknown): Array<T & { id: string }> {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, T>).map(([id, data]) => ({ id, ...data }));
}

export function sortByField<T>(items: T[], field: keyof T, direction: "asc" | "desc" = "asc") {
  return [...items].sort((a, b) => {
    const av = a[field] ?? "";
    const bv = b[field] ?? "";
    const result = String(av).localeCompare(String(bv));
    return direction === "asc" ? result : -result;
  });
}

export function subscribeList<T>(path: string, cb: (items: Array<T & { id: string }>) => void) {
  const dataRef = ref(db, path);
  onValue(dataRef, (snap) => cb(toList<T>(snap.val())));
  return () => off(dataRef);
}

export async function getList<T>(path: string) {
  const snap = await get(ref(db, path));
  return toList<T>(snap.val());
}

export async function getItem<T>(path: string) {
  const snap = await get(ref(db, path));
  return snap.exists() ? (snap.val() as T) : null;
}

export async function setItem<T>(path: string, data: T) {
  await set(ref(db, path), data);
}

export async function updateItem(path: string, data: Record<string, unknown>) {
  await update(ref(db, path), data);
}

export async function addItem<T extends Record<string, unknown>>(path: string, data: T) {
  const itemRef = push(ref(db, path));
  await set(itemRef, data);
  return itemRef;
}

export async function deleteItem(path: string) {
  await remove(ref(db, path));
}
