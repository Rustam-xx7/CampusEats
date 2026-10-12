import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { initialMenuItems } from "@/data/menuData";

const MENU_COLLECTION = "menu";

const byId = (a, b) => (Number(a.id) || 0) - (Number(b.id) || 0);

const docsToItems = (snapshot) => {
  const items = [];
  snapshot.forEach((d) => {
    const data = d.data();
    items.push({ ...data, id: data.id ?? d.id });
  });
  return items.sort(byId);
};

/** One-time fetch. Menu reads are public (no login needed). */
export async function getMenuFromFirebase() {
  try {
    const snapshot = await getDocs(collection(db, MENU_COLLECTION));
    if (!snapshot.empty) return docsToItems(snapshot);
  } catch (error) {
    console.warn("[Firestore Menu] Could not fetch menu:", error.message);
  }
  return initialMenuItems; // fallback only for display
}

/** Create or update a menu item. Admin only (enforced by Firestore rules). Throws on failure. */
export async function saveMenuItemInFirebase(item) {
  const docId = String(item.id);

  const formattedItem = {
    id: item.id,
    name: String(item.name || "").trim(),
    description: item.description || "",
    price: Number(item.price || 0),
    originalPrice: Number(item.originalPrice || item.price || 0),
    category: item.category || "Meals",
    image: item.image || "",
    isVeg: true,   // the whole menu is vegetarian
    prepTime: item.prepTime || "5 mins",
    rating: Number(item.rating || 4.8),
    badge: item.badge || "",
    station: item.station || "thali",
    isAvailable: item.isAvailable !== undefined ? Boolean(item.isAvailable) : true,
    stockCount: Number(item.stockCount ?? 20),
    updatedAt: new Date().toISOString(),
  };

  if (!formattedItem.name) throw new Error("Menu item needs a name.");
  if (!(formattedItem.price >= 0)) throw new Error("Menu item price is invalid.");

  await setDoc(doc(db, MENU_COLLECTION, docId), formattedItem, { merge: true });
  return formattedItem;
}

/**
 * Turn an item on or off ("86" toggle). Throws on failure.
 * setDoc+merge also works if the item was never seeded into Firestore.
 * To create the doc from a local item, pass the full item as the third argument.
 */
export async function updateMenuItemStockInFirebase(itemId, isAvailable, fullItem = null) {
  const docId = String(itemId);
  await setDoc(
    doc(db, MENU_COLLECTION, docId),
    {
      ...(fullItem || { id: itemId }),
      isAvailable: Boolean(isAvailable),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  return { id: itemId, isAvailable: Boolean(isAvailable) };
}

/** Run once from an admin account to copy the local menu into Firestore. */
export async function seedMenuToFirebase(menuList = initialMenuItems) {
  await Promise.all(menuList.map((item) => saveMenuItemInFirebase(item)));
  return true;
}

/**
 * Realtime menu listener. Public read, so it can start before login.
 * onUpdate is only called when the menu has items;
 * onError gets permission or network errors.
 */
export function subscribeToMenuFromFirebase(onUpdate, onError) {
  return onSnapshot(
    collection(db, MENU_COLLECTION),
    (snapshot) => {
      if (!snapshot.empty) onUpdate(docsToItems(snapshot));
    },
    (error) => {
      console.warn("Firestore menu listener error:", error.message);
      if (onError) onError(error);
    }
  );
}