import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase configuration using environment variables with default fallbacks
export const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    process.env.FIREBASE_DATABASE_URL,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    process.env.FIREBASE_APP_ID,
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase safely (avoid re-initialization on Next.js HMR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore, Realtime Database & Auth
const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth(app);

// Safe anonymous auth helper (if project requires authenticated users)
export async function ensureFirebaseAuth() {
  try {
    if (!auth.currentUser) {
      const { signInAnonymously } = await import("firebase/auth");
      await signInAnonymously(auth);
    }
    return auth.currentUser;
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
