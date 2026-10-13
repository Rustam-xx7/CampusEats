import crypto from "crypto";
import { adminDb, adminAuth, adminFirestore } from "@/server/firebaseAdmin";

const bad = (error, status = 400) =>
  Response.json({ success: false, error }, { status });

export async function POST(req) {
  const secret = process.env.STAFF_PASSCODE;
  if (!secret) return bad("Staff passcode is not configured.", 500);

  // Must be logged in
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  let user;
  try {
    user = await adminAuth().verifyIdToken(token);
  } catch {
    return bad("unauthorized", 401);
  }

  const { passcode } = await req.json();
  const a = crypto.createHash("sha256").update(String(passcode || "")).digest();
  const b = crypto.createHash("sha256").update(secret).digest();
  if (!crypto.timingSafeEqual(a, b)) {
    await new Promise((r) => setTimeout(r, 1500)); // slows down guessing
    return bad("Wrong passcode.", 403);
  }

  // Add to both staff lists
  await adminDb().ref(`admins/${user.uid}`).set(true);
  await adminFirestore().collection("admins").doc(user.uid).set({
    active: true,
    email: user.email || "",
    addedAt: new Date().toISOString(),
  });

  return Response.json({ success: true });
}