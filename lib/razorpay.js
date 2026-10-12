export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay checkout script.");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Opens Razorpay checkout. Resolves with the raw payment details.
 * Verification happens on the server (/api/razorpay/verify) together with the order update.
 */
export async function initiateRazorpayPayment({
  amount,
  studentName,
  studentRoll = "",
  phone,
  email = "",
  notes = {},
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error("Unable to connect to Razorpay. Check your internet connection.");
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) throw new Error("Payment is not configured (missing Razorpay key).");

  // 1. Create the Razorpay order on the server
  const orderRes = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: Number(amount),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { studentName, studentRoll, ...notes },
    }),
  });

  const orderData = await orderRes.json();
  if (!orderRes.ok || !orderData.success) {
    throw new Error(orderData.error || "Failed to initialize payment gateway.");
  }

  // 2. Open the checkout popup
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const options = {
      key: orderData.keyId || keyId,
      amount: orderData.amount, // paise
      currency: orderData.currency || "INR",
      name: "CSJMU Cafeteria",
      description: "Campus Dining Bill - Token Payment",
      order_id: orderData.orderId,
      prefill: {
        name: studentName,
        email: email || undefined,
        contact: phone ? phone.replace(/[^0-9]/g, "").slice(-10) : undefined,
      },
      theme: { color: "#a20513" },
      modal: {
        ondismiss: () =>
          finish({
            success: false,
            cancelled: true,
            message: "Payment window was closed. Order was not placed.",
          }),
      },
      handler: (response) =>
        finish({
          success: true,
          paymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        }),
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) =>
      finish({
        success: false,
        error: response.error?.description || "Payment failed at bank/gateway level.",
      })
    );
    rzp.open();
  });
}