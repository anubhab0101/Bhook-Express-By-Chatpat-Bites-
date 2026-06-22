import { Router } from "express";
import { getAdminAuth, getAdminDb } from "../lib/firebaseAdmin";
import { sendSms } from "../lib/smsGate";
import { logger } from "../lib/logger";

const router = Router();
const otpStore = new Map<string, { otp: string; name: string; expiresAt: number }>();

function normalizeIndianPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (phone.startsWith("+91") && digits.length === 12) return phone;
  throw new Error("Enter a valid 10-digit Indian phone number");
}

function otp() {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

router.post("/auth/send-otp", async (req, res, next) => {
  try {
    const phone = normalizeIndianPhone(String(req.body.phone || ""));
    const name = String(req.body.name || "").trim();
    if (name.length < 2) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const code = otp();
    otpStore.set(phone, { otp: code, name, expiresAt: Date.now() + 5 * 60 * 1000 });
    const smsResult = await sendSms(phone, `${code} - you can use this for Bhookh Express By (Chatpata Bites).`);
    logger.info({
      phone: `${phone.slice(0, 3)}******${phone.slice(-2)}`,
      providerStatus: smsResult.providerStatus,
      providerResponse: smsResult.providerResponse,
    }, "OTP SMS queued by SMS-Gate");
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/verify-otp", async (req, res, next) => {
  try {
    const phone = normalizeIndianPhone(String(req.body.phone || ""));
    const code = String(req.body.otp || "").trim();
    const record = otpStore.get(phone);

    if (!record || record.expiresAt < Date.now() || record.otp !== code) {
      res.status(400).json({ error: "Invalid or expired OTP" });
      return;
    }

    otpStore.delete(phone);
    const uid = `phone_${phone.replace(/\D/g, "")}`;
    const db = getAdminDb();
    const userRef = db.ref(`users/${uid}`);
    const existing = await userRef.get();
    const existingData = existing.val() || {};
    const isAdminPhone = phone === `+91${process.env.VITE_ADMIN_PHONE || ""}`;
    const now = new Date().toISOString();

    await userRef.update({
      uid,
      name: record.name,
      phone,
      email: "",
      role: isAdminPhone ? "admin" : existingData.role || "customer",
      loyaltyStamps: existingData.loyaltyStamps || 0,
      rewardAvailable: existingData.rewardAvailable || false,
      totalOrders: existingData.totalOrders || 0,
      totalSpent: existingData.totalSpent || 0,
      createdAt: existing.exists() ? existingData.createdAt : now,
      updatedAt: now,
    });

    const customToken = await getAdminAuth().createCustomToken(uid, { phone });
    res.json({ customToken });
  } catch (err) {
    next(err);
  }
});

export default router;
