import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt, notes = {} } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid total bill amount specified." },
        { status: 400 }
      );
    }

    const key_id =
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "rzp_test_TmxSc9P6WVPBf7";
    const key_secret =
      process.env.RAZORPAY_KEY_SECRET || "qgAlQ17MHw6o8xQb6WEbJ5lt";

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { success: false, error: "Razorpay credentials not configured on server." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret
    });

    // Razorpay requires amount in paise (1 INR = 100 paise)
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: key_id
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to initialize Razorpay payment order."
      },
      { status: 500 }
    );
  }
}
