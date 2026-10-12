import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";

const USERS_COLLECTION = "users";

/** Log in with a Google popup. */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const profile = await getUserProfileFromFirestore(user.uid);
    return { user, profile };
  } catch (error) {
    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      throw new Error("Login cancelled.");
    }
    console.error("Google Login Error:", error);
    throw error;
  }
}

export async function logoutFromFirebase() {
  await signOut(auth);
}

/** Read the user's own profile. Returns null if it doesn't exist yet. */
export async function getUserProfileFromFirestore(uid) {
  try {
    const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.warn("Could not fetch user profile from Firestore:", error.message);
    return null;
  }
}

/**
 * Save basic profile info. Roles are NOT stored here:
 * staff status comes from the /admins list in the database,
 * and the Firestore rules reject any attempt to write "role".
 */
export async function saveUserProfileToFirestore(uid, userData) {
  const data = {
    uid,
    email: userData.email || "",
    displayName: userData.displayName || "CSJMU User",
    photoURL: userData.photoURL || "",
    updatedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, USERS_COLLECTION, uid), data, { merge: true });
  return data;
}

/** Calls back with the Firebase user (or null). */
export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, (user) => callback(user));
}

/** Realtime listener for the user's profile. */
export function subscribeToUserProfile(uid, callback, onError) {
  if (!uid) return () => {};
  return onSnapshot(
    doc(db, USERS_COLLECTION, uid),
    (snap) => callback(snap.exists() ? snap.data() : null),
    (error) => {
      console.warn("Firestore user realtime listener warning:", error.message);
      if (onError) onError(error);
    }
  );
}