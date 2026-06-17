# Restaurant Harmony Deployment Guide

## What Is Implemented

- Customer ordering, dine-in table orders, home delivery orders, cart, profile, rewards, kitchen dashboard, delivery dashboard, and admin screens.
- Firebase Authentication with Google and phone OTP.
- Firestore-backed menu, orders, rewards, users, settings, and payments.
- Razorpay order creation and server-side signature verification.
- COD order flow.
- PWA manifest and service worker.
- Firestore and Storage security rules.

## Secrets Required Before Live Deploy

Copy `.env.example` to your production environment and fill:

- Firebase web config: `VITE_FIREBASE_*`
- Firebase Admin credentials: `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- SMS-Gate: `SMSGATE_*`
- Admin identity: `VITE_ADMIN_EMAIL`, `VITE_ADMIN_PHONE`

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication providers:
   - Google
   - Phone
3. Create Firestore database.
4. Create Firebase Storage bucket.
5. Publish `firestore.rules` to Firestore rules.
6. Publish `storage.rules` to Storage rules.
7. Add your production domain to Firebase Authentication authorized domains.

## Build And Run

This repository is configured as a pnpm workspace.

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm run build
pnpm start
```

The server listens on `PORT` and serves both `/api/*` and the built frontend.

## Deployment Target

The current project is a Vite React frontend plus an Express API server. Deploy it as a Node server where long-running Express apps are supported, or convert the API to Vercel serverless functions before a pure Vercel deployment.

For a single Node deployment:

- Build command: `pnpm run build`
- Start command: `pnpm start`
- Port: use the platform-provided `PORT`

## Render Keep-Alive

Render free services may sleep when idle. The reliable fix is a paid Render instance. This project also includes an opt-in keep-alive ping for your own service URL:

```env
KEEP_ALIVE_ENABLED=true
KEEP_ALIVE_URL=https://your-service.onrender.com
KEEP_ALIVE_INTERVAL_MS=600000
```

After deployment, set `KEEP_ALIVE_URL` to the public Render URL. The server will ping `/api/healthz` every 10 minutes.

## Smoke Test Before Going Live

1. Open `/setup` as the admin account.
2. Save restaurant settings.
3. Add menu items in `/admin/menu`.
4. Generate table QR codes in `/admin/qr`.
5. Place a COD order.
6. Move it through `/kitchen`.
7. Place a Razorpay test payment.
8. Confirm `/admin/payments` has a payment record.
9. Confirm `/orders` updates in real time.
