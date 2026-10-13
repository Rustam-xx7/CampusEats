import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getAuth } from "firebase-admin/auth";

function init() {
  if (getApps().length) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set.");

  const account = JSON.parse(raw);
  // Vercel often stores the key's line breaks as the two characters \n
  account.private_key = account.private_key.replace(/\\n/g, "\n");

  initializeApp({
    credential: cert(account),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

// Called inside request handlers, never at import time
export function adminDb() { init(); return getDatabase(); }
export function adminAuth() { init(); return getAuth(); }