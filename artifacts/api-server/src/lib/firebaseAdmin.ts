import admin from "firebase-admin";

let app: admin.app.App | null = null;

function getCredential() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    return admin.credential.cert(JSON.parse(json));
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return admin.credential.cert({ projectId, clientEmail, privateKey });
  }

  return admin.credential.applicationDefault();
}

export function getAdminApp() {
  if (!app) {
    app = admin.initializeApp({
      credential: getCredential(),
      databaseURL: process.env.FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
  return app;
}

export function getAdminDb() {
  return getAdminApp().database();
}

export function getAdminMessaging() {
  return getAdminApp().messaging();
}

export function getAdminAuth() {
  return getAdminApp().auth();
}
