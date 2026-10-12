import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

export const RTDB_URL =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  process.env.FIREBASE_DATABASE_URL ||
  "https://firsttest-5a995-default-rtdb.firebaseio.com/";

// Firebase configuration using environment variables with robust defaults for build/deployment
export const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    "AIzaSyCuqqwpSqzPklWjp6SGLCCQlfUdANojT3Q",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.FIREBASE_AUTH_DOMAIN ||
    "firsttest-5a995.firebaseapp.com",
  databaseURL: RTDB_URL,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    "firsttest-5a995",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET ||
    "firsttest-5a995.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.FIREBASE_MESSAGING_SENDER_ID ||
    "82773201543",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    process.env.FIREBASE_APP_ID ||
    "1:82773201543:web:b0eecfaf1f312a35019e22",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    process.env.FIREBASE_MEASUREMENT_ID ||
    "G-NVBK83HBK6"
};

// Initialize Firebase safely (avoid re-initialization on Next.js HMR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore, Realtime Database & Auth safely
let db;
try {
  db = getFirestore(app);
} catch (e) {
  console.warn("[Firebase] Firestore init:", e.message);
}

let rtdb;
try {
  rtdb = getDatabase(app, RTDB_URL);
} catch (e) {
  console.warn("[Firebase] Realtime Database init:", e.message);
}

let auth;
try {
  auth = getAuth(app);
} catch (e) {
  console.warn("[Firebase] Auth init:", e.message);
}

// Safe anonymous auth helper (if project requires authenticated users)
export async function ensureFirebaseAuth() {
  try {
    if (auth && !auth.currentUser) {
      const { signInAnonymously } = await import("firebase/auth");
      await signInAnonymously(auth);
    }
    return auth ? auth.currentUser : null;
  } catch (err) {
    // If anonymous auth is not yet toggled on in Firebase Console
    return null;
  }
}

// Analytics only in browser environment
let analytics = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics not supported in this environment
    });
}

export { app, db, rtdb, auth, analytics };
export default app;

