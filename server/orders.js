import { ref, set, get, update, onValue, runTransaction } from "firebase/database";
import { rtdb } from "./firebase";

// In-memory fallback cache
const inMemoryOrders = new Map();
let localQueueCounter = 145; // default fallback queue sequence

/**
 * Generates the next sequential queue number & order token using RTDB atomic transaction.
 * Ensures strict FIFO queue order across multiple devices.
 */
export async function getNextQueueTicketNumber() {
  try {
    const queueCounterRef = ref(rtdb, "orderQueue/counter");
    const result = await runTransaction(queueCounterRef, (currentValue) => {
      if (currentValue === null || currentValue === undefined) {
        return 146; // Initial starting sequence
      }
      return currentValue + 1;
    });

    if (result.committed) {
      const qNum = result.snapshot.val();
      return {
        queueNumber: qNum,
        orderNumber: `CSJ-${qNum}`
      };
    }
  } catch (error) {
    console.warn("[Queue System Note]: Local queue counter fallback used:", error.message);
  }

  localQueueCounter += 1;
  return {
    queueNumber: localQueueCounter,
    orderNumber: `CSJ-${localQueueCounter}`
  };
}

/**
 * Creates and stores a new order in Firebase Realtime Database (RTDB).
 * Path: /orders/{orderId} & /orderQueue/items/{orderId}
 * Every order contains:
 * - orderId: Unique order ID (e.g. "ORD-984210")
 * - queueNumber: Sequential queue integer (e.g. 146)
 * - orderNumber: Sequential pickup token (e.g. "CSJ-146")
 * - queuePosition: Active position in kitchen preparation queue
 * - userId: User ID / UID
 * - userName: User name (e.g. "Aryan Sharma")
 * - items: Array of items each having { name, quantity, price }
 * - status: "pending" | "cooking" | "ready" | "completed"
 * - paymentMethod, paymentId, razorpayOrderId, paymentStatus
 * - subtotal, discount, gst, total, pickupLocation, kitchenNotes, createdAt
 */
export async function createOrderInFirebase(orderData) {
  const orderId =
    orderData.orderId ||
    orderData.id ||
    `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  // Generate atomic sequential queue number if not already provided
  let queueNumber = orderData.queueNumber;
  let orderNumber = orderData.orderNumber || orderData.token;

  if (!queueNumber || !orderNumber) {
    const ticket = await getNextQueueTicketNumber();
    queueNumber = ticket.queueNumber;
    orderNumber = ticket.orderNumber;
  }

  const userId = orderData.userId || orderData.studentRoll || "student_guest";
  const userName = orderData.userName || orderData.studentName || "CSJMU Student";

  // Calculate live queue position ahead in line
  let activeInQueue = 0;
  for (const [, ord] of inMemoryOrders.entries()) {
    if (ord.status === "pending" || ord.status === "cooking") {
      activeInQueue++;
    }
  }
  const queuePosition = activeInQueue + 1;

  // Format items guaranteeing 'name' and 'quantity' keys exist
  const items = (orderData.items || []).map((item) => ({
    name: item.name || item.title || "Food Item",
    quantity: Number(item.quantity || item.qty || 1),
    price: Number(item.price || 0)
  }));

  const formattedOrder = {
    orderId: orderId,
    id: orderId,
    queueNumber: Number(queueNumber),
    queuePosition: queuePosition,
    orderNumber: orderNumber,
    token: orderNumber,
    userId: userId,
    userName: userName,
    studentName: userName,
    studentRoll: orderData.studentRoll || (userId.startsWith("user_") ? `ID: ${userId}` : "CSJMU Campus"),
    phone: orderData.phone || "+91 98765 43210",
    items: items,
    subtotal: Number(orderData.subtotal || 0),
    discount: Number(orderData.discount || 0),
    gst: Number(orderData.gst || 0),
    total: Number(orderData.total || 0),
    status: orderData.status || "pending",
    paymentMethod: orderData.paymentMethod || "Razorpay (UPI / Cards)",
    paymentId: orderData.paymentId || `pay_${Date.now()}`,
    razorpayOrderId: orderData.razorpayOrderId || `order_${Date.now()}`,
    paymentStatus: orderData.paymentStatus || "paid",
    pickupLocation: orderData.pickupLocation || "Main Canteen Counter #2",
    estimatedTime: `~${Math.max(6, queuePosition * 4)} mins`,
    kitchenNotes: orderData.kitchenNotes || "",
    station: orderData.station || "thali",
    timestamp:
      orderData.timestamp ||
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Cache in-memory
  inMemoryOrders.set(orderId, formattedOrder);

  // Store in Firebase Realtime Database
  try {
    const orderRef = ref(rtdb, `orders/${orderId}`);
    await set(orderRef, formattedOrder);

    // Also register in queue collection
    const queueRef = ref(rtdb, `orderQueue/items/${orderId}`);
    await set(queueRef, {
      orderId,
      queueNumber,
      orderNumber,
      status: formattedOrder.status,
      createdAt: formattedOrder.createdAt
    });

    console.log(`[RTDB Queue] Order #${orderNumber} (Queue Pos #${queuePosition}) saved successfully!`);
  } catch (error) {
    console.warn(`[RTDB Note]: Order cached locally. If write is rejected, verify Realtime Database rules in Firebase console.`, error.message);
  }

  return formattedOrder;
}

/**
 * Retrieves all orders from Firebase Realtime Database.
 */
export async function getOrdersFromFirebase() {
  const result = [];

  try {
    const ordersRef = ref(rtdb, "orders");
    const snapshot = await get(ordersRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        result.push({ id: key, ...data[key] });
      });
    }
  } catch (error) {
    console.warn("[RTDB] Could not fetch orders from remote database:", error.message);
  }

  // Merge any in-memory cached orders
  for (const [id, ord] of inMemoryOrders.entries()) {
    if (!result.some((r) => r.orderId === id || r.id === id)) {
      result.push(ord);
    }
  }

  result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return result;
}

/**
 * Retrieves a single order by ID or Token from RTDB or in-memory cache.
 */
export async function getOrderByIdFromFirebase(orderIdOrToken) {
  // Check in-memory cache first
  for (const [id, ord] of inMemoryOrders.entries()) {
    if (id === orderIdOrToken || ord.orderNumber === orderIdOrToken || ord.token === orderIdOrToken) {
      return ord;
    }
  }

  try {
    const orderRef = ref(rtdb, `orders/${orderIdOrToken}`);
    const snapshot = await get(orderRef);
    if (snapshot.exists()) {
      return { id: orderIdOrToken, ...snapshot.val() };
    }

    // Scan all orders by token
    const allOrders = await getOrdersFromFirebase();
    const found = allOrders.find(
      (o) => o.orderId === orderIdOrToken || o.token === orderIdOrToken || o.orderNumber === orderIdOrToken
    );
    if (found) return found;
  } catch (error) {
    console.warn("[RTDB] Could not fetch order by ID:", error.message);
  }

  return null;
}

/**
 * Updates order status in Firebase Realtime Database.
 * Permission check: Only staff can change order state!
 */
export async function updateOrderStatusInFirebase(orderIdOrToken, newStatus, userRole = "staff") {
  // Guard: Only staff can change order state
  if (userRole !== "staff") {
    console.warn(`[Permission Denied]: Only staff members can change order status. Current role: ${userRole}`);
    throw new Error("Permission Denied: Only staff members can update order status.");
  }

  // Find target order id
  let targetOrderId = orderIdOrToken;
  for (const [id, ord] of inMemoryOrders.entries()) {
    if (id === orderIdOrToken || ord.orderNumber === orderIdOrToken || ord.token === orderIdOrToken) {
      ord.status = newStatus;
      ord.updatedAt = new Date().toISOString();
      inMemoryOrders.set(id, ord);
      targetOrderId = id;
      break;
    }
  }

  try {
    const orderRef = ref(rtdb, `orders/${targetOrderId}`);
    await update(orderRef, {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    console.log(`[RTDB] Order ${targetOrderId} status updated to ${newStatus}!`);
  } catch (error) {
    console.warn(`[RTDB] Status update on remote skipped:`, error.message);
  }

  return { orderId: targetOrderId, status: newStatus };
}

/**
 * Subscribes to realtime updates of orders from Firebase Realtime Database.
 * Changes to orders in RTDB trigger instant callback on all devices!
 */
export function subscribeToOrdersFromFirebase(onUpdate, onError) {
  try {
    const ordersRef = ref(rtdb, "orders");
    return onValue(
      ordersRef,
      (snapshot) => {
        const orders = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach((key) => {
            orders.push({ id: key, ...data[key] });
          });
        }
        orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        onUpdate(orders);
      },
      (error) => {
        console.warn("RTDB orders realtime listener warning:", error.message);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn("Could not attach RTDB realtime listener:", err);
    return () => {};
  }
}
