import crypto from "crypto";
import Razorpay from "razorpay";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const bad = (error, status = 400) => Response.json({ success: false, error }, { status });

export async function POST(req) {
  // 1. Who is calling
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  let user;
  try {
    user = await getAuth().verifyIdToken(token);
  } catch {
    return bad("unauthorized", 401);
  }

  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return bad("missing fields");
  }

  // 2. Signature check
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(razorpay_signature));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return bad("bad signature");

  // 3. The order must belong to this user and still be unpaid
  const db = getDatabase();
  const orderRef = db.ref(`orders/${orderId}`);
  const snap = await orderRef.get();
  if (!snap.exists() || snap.val().userId !== user.uid) return bad("forbidden", 403);
  const order = snap.val();
  if (order.paymentStatus === "paid") return Response.json({ success: true, already: true });

  // 4. The amount actually paid must match the order total
  let rzOrder;
  try {
    rzOrder = await razorpay.orders.fetch(razorpay_order_id);
  } catch {
    return bad("could not verify payment with Razorpay", 502);
  }
  if (rzOrder.status !== "paid") return bad("payment not completed");
  if (Number(rzOrder.amount) !== Math.round(Number(order.total) * 100)) {
    return bad("amount mismatch");
  }

  // 5. One Razorpay payment can be used for only one order
  const claim = await db.ref(`usedPayments/${razorpay_order_id}`).transaction((cur) =>
    cur === null ? orderId : undefined
  );
  if (!claim.committed && claim.snapshot.val() !== orderId) return bad("payment already used", 409);

  // 6. Mark paid (Admin SDK bypasses the client rules)
  await orderRef.update({
    paymentStatus: "paid",
    paymentId: razorpay_payment_id,
    razorpayOrderId: razorpay_order_id,
    updatedAt: new Date().toISOString(),
  });

  return Response.json({ success: true });
}