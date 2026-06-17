import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { getItem, nowIso, setItem, updateItem } from "@/lib/rtdb";
import type { User, UserRole } from "@/types";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE;
const AUTH_LOADING_TIMEOUT_MS = 1500;

interface AuthContextType {
  user: User | null;
  firebaseUser: import("firebase/auth").User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isKitchen: boolean;
  isDelivery: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<import("firebase/auth").User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fallback = window.setTimeout(() => {
      console.warn("Auth initialization timed out");
      setLoading(false);
    }, AUTH_LOADING_TIMEOUT_MS);

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        setFirebaseUser(fbUser);
        if (fbUser) {
          await syncUser(fbUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth sync failed", err);
        setUser(null);
      } finally {
        window.clearTimeout(fallback);
        setLoading(false);
      }
    });
    return () => {
      window.clearTimeout(fallback);
      unsub();
    };
  }, []);

  async function syncUser(fbUser: import("firebase/auth").User) {
    const existing = await getItem<User>(`users/${fbUser.uid}`);

    let role: UserRole = "customer";
    if (fbUser.email === ADMIN_EMAIL || fbUser.phoneNumber === `+91${ADMIN_PHONE}`) {
      role = "admin";
    }

    if (!existing) {
      const newUser: User = {
        uid: fbUser.uid,
        name: fbUser.displayName || fbUser.phoneNumber || "Guest",
        email: fbUser.email || "",
        phone: fbUser.phoneNumber || "",
        role,
        loyaltyStamps: 0,
        rewardAvailable: false,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: nowIso(),
      };
      await setItem(`users/${fbUser.uid}`, newUser);
      setUser(newUser);
    } else {
      const data = existing;
      if (data.email === ADMIN_EMAIL || data.phone === ADMIN_PHONE) {
        if (data.role !== "admin") {
          await updateItem(`users/${fbUser.uid}`, { role: "admin" });
          data.role = "admin";
        }
      }
      setUser({ ...data, uid: fbUser.uid });
    }
  }

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  async function signInWithEmail(email: string, password: string, name?: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (name && !result.user.displayName) {
        await updateItem(`users/${result.user.uid}`, { name });
      }
    } catch (err: any) {
      if (err.code !== "auth/user-not-found" && err.code !== "auth/invalid-credential") throw err;
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setItem(`users/${result.user.uid}`, {
        uid: result.user.uid,
        name: name || email.split("@")[0],
        email,
        phone: "",
        role: email === ADMIN_EMAIL ? "admin" : "customer",
        loyaltyStamps: 0,
        rewardAvailable: false,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: nowIso(),
      });
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
    setUser(null);
  }

  const isAdmin = user?.role === "admin";
  const isKitchen = user?.role === "kitchen" || isAdmin;
  const isDelivery = user?.role === "delivery" || isAdmin;
  const isManager = user?.role === "manager" || isAdmin;

  return (
    <AuthContext.Provider
      value={{ user, firebaseUser, loading, signInWithGoogle, signInWithEmail, signOut, isAdmin, isKitchen, isDelivery, isManager }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
