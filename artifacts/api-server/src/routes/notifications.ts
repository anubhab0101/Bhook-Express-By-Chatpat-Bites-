import { Router } from "express";
import { getAdminDb, getAdminMessaging } from "../lib/firebaseAdmin";
import { sendSms } from "../lib/smsGate";

const router = Router();

router.post("/notifications/push", async (req, res, next) => {
  try {
    const { token, title, body, data } = req.body;
    if (!token || !title || !body) {
      res.status(400).json({ error: "token, title and body are required" });
      return;
    }

    const id = await getAdminMessaging().send({ token, notification: { title, body }, data });
    await getAdminDb().ref("notifications").push({
      token,
      title,
      body,
      data: data || {},
      status: "sent",
      providerMessageId: id,
      createdAt: new Date().toISOString(),
    });
    res.json({ id });
  } catch (err) {
    next(err);
  }
});

router.post("/notifications/sms", async (req, res, next) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      res.status(400).json({ error: "phone and message are required" });
      return;
    }

    res.json(await sendSms(phone, message));
  } catch (err) {
    next(err);
  }
});

router.post("/notifications/email", async (_req, res) => {
  res.status(501).json({
    error: "SMTP provider is not connected on this server yet. Configure a transactional mail provider or add nodemailer SMTP transport before enabling email sends.",
  });
});

export default router;
