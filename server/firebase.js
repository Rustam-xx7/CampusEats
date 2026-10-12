import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

// NEXT_PUBLIC_ vars must be referenced statically so Next.js can inline them.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const RTDB_URL = firebaseConfig.databaseURL;

if (!firebaseConfig.projectId || !firebaseConfig.databaseURL) {
  console.error("[Firebase] Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_DATABASE_URL");
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const rtdb = getDatabase(app);   // uses databaseURL from config
const auth = getAuth(app);

// Resolves once Firebase has restored any saved session (user or null).
// Start every Firestore/RTDB listener AFTER this.
export const authReady = auth.authStateReady().then(() => auth.currentUser);

// Only call this if you really support guest users.
export async function ensureFirebaseAuth() {
  await auth.authStateReady();
  if (!auth.currentUser) {
    try { await signInAnonymously(auth); } catch { /* anonymous auth disabled */ }
  }
  return auth.currentUser;
}

let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((ok) => { if (ok) analytics = getAnalytics(app); }).catch(() => {});
}

export { app, db, rtdb, auth, analytics };
export default app;