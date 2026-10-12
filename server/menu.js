import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  onSnapshot
} from "firebase/firestore";
import { db, ensureFirebaseAuth } from "./firebase";
import { initialMenuItems } from "@/data/menuData";

// Firestore collection name for menu
const MENU_COLLECTION = "menu";

/**
 * Fetches menu items from Firestore.
 * If Firestore is empty, seeds with initialMenuItems.
 */
export async function getMenuFromFirebase() {
  try {
    await ensureFirebaseAuth();
    const menuRef = collection(db, MENU_COLLECTION);
    const snapshot = await getDocs(menuRef);

    if (!snapshot.empty) {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      items.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
      return items;
    }
  } catch (error) {
    console.warn("[Firestore Menu] Could not fetch menu from Firestore:", error.message);
  }

  // Fallback to initial menu items
  return initialMenuItems;
}

/**
 * Saves or updates a menu item in Firestore collection 'menu'.
 */
export async function saveMenuItemInFirebase(item) {
  const docId = String(item.id);

  const formattedItem = {
    id: item.id,
    name: item.name,
    description: item.description || "",
    price: Number(item.price || 0),
    originalPrice: Number(item.originalPrice || item.price || 0),
    category: item.category || "Meals",
    image: item.image || "",
    isVeg: Boolean(item.isVeg),
    isEgg: Boolean(item.isEgg),
    prepTime: item.prepTime || "5 mins",
    rating: Number(item.rating || 4.8),
    badge: item.badge || "",
    station: item.station || "thali",
    isAvailable: item.isAvailable !== undefined ? Boolean(item.isAvailable) : true,
    stockCount: Number(item.stockCount || 20),
    updatedAt: new Date().toISOString()
  };

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, MENU_COLLECTION, docId);
    await setDoc(docRef, formattedItem, { merge: true });
    console.log(`[Firestore] Menu item ${item.name} (${docId}) saved.`);
  } catch (error) {
    console.warn(`[Firestore Note] Menu item cached locally:`, error.message);
  }

  return formattedItem;
}

/**
 * Updates stock availability for a menu item in Firestore (Immediate 86 toggle).
 */
export async function updateMenuItemStockInFirebase(itemId, isAvailable) {
  const docId = String(itemId);

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, MENU_COLLECTION, docId);
    await updateDoc(docRef, {
      isAvailable: Boolean(isAvailable),
      updatedAt: new Date().toISOString()
    });
    console.log(`[Firestore] Stock for item ${docId} set to ${isAvailable}`);
  } catch (error) {
    console.warn("[Firestore] Menu stock update note:", error.message);
  }

  return { id: itemId, isAvailable };
}

/**
 * Seeds initial menu items to Firestore collection 'menu'.
 */
export async function seedMenuToFirebase(menuList = initialMenuItems) {
  try {
    const promises = menuList.map((item) => saveMenuItemInFirebase(item));
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.warn("[Firestore] Seed menu note:", error.message);
    return false;
  }
}

/**
 * Realtime listener for menu updates from Firestore.
 */
export function subscribeToMenuFromFirebase(onUpdate, onError) {
  try {
    const menuRef = collection(db, MENU_COLLECTION);
    return onSnapshot(
      menuRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items = [];
          snapshot.forEach((docSnap) => {
            items.push({ id: docSnap.id, ...docSnap.data() });
          });
          items.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
          onUpdate(items);
        }
      },
      (error) => {
        console.warn("Firestore menu listener note:", error.message);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn("Could not attach Firestore menu realtime listener:", err);
    return () => {};
  }
}

