import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payment verification parameters (order_id, payment_id, signature)."
        },
        { status: 400 }
      );
    }

    const key_secret =
      process.env.RAZORPAY_KEY_SECRET || "qgAlQ17MHw6o8xQb6WEbJ5lt";

    // Compute HMAC SHA256 of order_id|payment_id using the Razorpay key secret
    const generatedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isMatch = generatedSignature === razorpay_signature;

    if (!isMatch) {
      console.warn("Razorpay payment signature mismatch detected.");
      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed: cryptographic signature mismatch."
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Razorpay payment verified successfully.",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });
  } catch (error) {
    console.error("Razorpay Verify Payment Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to verify payment signature."
      },
      { status: 500 }
    );
  }
}
