import {
  ref, get, set, update, onValue, runTransaction, push,
  query, orderByChild, equalTo,
} from "firebase/database";
import { rtdb, auth } from "./firebase";

const nowISO = () => new Date().toISOString();

/** Atomic queue number. No local fallback: duplicates across devices are worse than an error. */
export async function getNextQueueTicketNumber() {
  const result = await runTransaction(ref(rtdb, "orderQueue/counter"), (cur) =>
    cur === null || cur === undefined ? 146 : cur + 1
  );
  if (!result.committed) throw new Error("Could not get a queue number. Please try again.");
  const n = result.snapshot.val();
  return { queueNumber: n, orderNumber: `CSJ-${n}` };
}

/** Creates an UNPAID order. Payment status is changed to "paid" only by your server after verification. */
export async function createOrderInFirebase(orderData) {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) throw new Error("Please log in to place an order.");

  const orderId = push(ref(rtdb, "orders")).key;
  const { queueNumber, orderNumber } = await getNextQueueTicketNumber();
  const createdAt = nowISO();

  const items = (orderData.items || []).map((item) => ({
    name: String(item.name || item.title || "Food Item"),
    quantity: Number(item.quantity || item.qty || 1),
    price: Number(item.price || 0),
  }));
  if (!items.length) throw new Error("Cart is empty.");

  const userName = orderData.userName || orderData.studentName || user.displayName || "Student";

  const order = {
    orderId,
    id: orderId,
    queueNumber,
    orderNumber,
    token: orderNumber,
    userId: user.uid,                       // always the real Firebase uid
    userName,
    studentName: userName,
    studentRoll: orderData.studentRoll || "",
    phone: orderData.phone || "",
    items,
    subtotal: Number(orderData.subtotal || 0),
    discount: Number(orderData.discount || 0),
    gst: Number(orderData.gst || 0),
    total: Number(orderData.total || 0),
    status: "pending",
    paymentMethod: orderData.paymentMethod || "Razorpay",
    paymentId: "",
    razorpayOrderId: orderData.razorpayOrderId || "",
    paymentStatus: "pending",               // never "paid" from the browser
    pickupLocation: orderData.pickupLocation || "Main Canteen Counter #2",
    kitchenNotes: orderData.kitchenNotes || "",
    station: orderData.station || "thali",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    createdAt,
    updatedAt: createdAt,
  };

  // Errors are thrown so the UI can tell the user the order failed.
  await set(ref(rtdb, `orders/${orderId}`), order);
  await set(ref(rtdb, `orderQueue/items/${orderId}`), {
    orderId, queueNumber, orderNumber, status: "pending", createdAt,
  });
  return order;
}

const toList = (snapshot) => {
  const list = [];
  snapshot.forEach((child) => { list.push({ id: child.key, ...child.val() }); });
  return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

const myOrdersQuery = (uid) => query(ref(rtdb, "orders"), orderByChild("userId"), equalTo(uid));

/** Student: own orders only. */
export async function getMyOrders(uid) {
  return toList(await get(myOrdersQuery(uid)));
}
export function subscribeToMyOrders(uid, onUpdate, onError) {
  return onValue(myOrdersQuery(uid), (s) => onUpdate(toList(s)), (e) => onError?.(e));
}

/** Staff/admin only: all orders. Will be permission_denied for students (intended). */
export async function getAllOrders() {
  return toList(await get(ref(rtdb, "orders")));
}
export function subscribeToAllOrders(onUpdate, onError) {
  return onValue(ref(rtdb, "orders"), (s) => onUpdate(toList(s)), (e) => onError?.(e));
}

/** Look up by order id, or by token like "CSJ-146" via the queue index. */
export async function getOrderByIdFromFirebase(idOrToken) {
  const direct = await get(ref(rtdb, `orders/${idOrToken}`));
  if (direct.exists()) return { id: idOrToken, ...direct.val() };

  const hit = await get(
    query(ref(rtdb, "orderQueue/items"), orderByChild("orderNumber"), equalTo(idOrToken))
  );
  let orderId = null;
  hit.forEach((c) => { orderId = c.key; });
  if (!orderId) return null;

  const full = await get(ref(rtdb, `orders/${orderId}`));
  return full.exists() ? { id: orderId, ...full.val() } : null; // owner/admin only
}

/** Staff only. Enforced by database rules, not by a role argument. */
export async function updateOrderStatusInFirebase(orderId, newStatus) {
  await update(ref(rtdb), {
    [`orders/${orderId}/status`]: newStatus,
    [`orders/${orderId}/updatedAt`]: nowISO(),
    [`orderQueue/items/${orderId}/status`]: newStatus,
  });
  return { orderId, status: newStatus };
}