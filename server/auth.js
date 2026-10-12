import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";

// Firestore collection name for user data
const USERS_COLLECTION = "users";

/**
 * Log in with Google Popup.
 */
export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Fetch existing user profile & role from Firestore
    const userProfile = await getUserProfileFromFirestore(user.uid);
    return { user, profile: userProfile };
  } catch (error) {
    console.error("Google Login Error:", error);
    throw error;
  }
}

/**
 * Log out from Firebase.
 */
export async function logoutFromFirebase() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
}

/**
 * Fetch user data from Firestore collection 'users'.
 */
export async function getUserProfileFromFirestore(uid) {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.warn("Could not fetch user profile from Firestore:", error.message);
    return null;
  }
}

/**
 * Save or update user data in Firestore collection 'users'.
 * Stores:
 * - uid: User unique ID
 * - email: Google email
 * - displayName: User name
 * - photoURL: Avatar image
 * - role: "student" | "staff"
 * - staffId: Staff ID number (required for staff, null for student)
 * - updatedAt: ISO string
 */
export async function saveUserProfileToFirestore(uid, userData) {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const dataToSave = {
      uid: uid,
      email: userData.email || "",
      displayName: userData.displayName || "CSJMU User",
      photoURL: userData.photoURL || "",
      role: userData.role || "student", // default student
      staffId: userData.role === "staff" ? (userData.staffId || "").trim() : null,
      updatedAt: new Date().toISOString()
    };

    await setDoc(userDocRef, dataToSave, { merge: true });
    return dataToSave;
  } catch (error) {
    console.warn("Could not save user profile to Firestore (using local state):", error.message);
    return userData;
  }
}

/**
 * Validate Staff ID number.
 * Can be any non-empty identifier (e.g. STAFF-101, KITCHEN-2024, CSJMU-CHEF-01).
 */
export function validateStaffId(staffId) {
  if (!staffId || typeof staffId !== "string") return false;
  const trimmed = staffId.trim();
  // Valid if at least 3 characters alphanumeric
  return trimmed.length >= 3;
}

/**
 * Subscribe to Auth State changes.
 */
export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await getUserProfileFromFirestore(user.uid);
      callback(user, profile);
    } else {
      callback(null, null);
    }
  });
}

/**
 * Realtime listener for user profile changes from Firestore.
 */
export function subscribeToUserProfile(uid, callback) {
  if (!uid) return () => {};
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    return onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data());
        }
      },
      (error) => {
        console.warn("Firestore user realtime listener warning:", error.message);
      }
    );
  } catch (err) {
    console.warn("Could not attach user profile listener:", err);
    return () => {};
  }
}

