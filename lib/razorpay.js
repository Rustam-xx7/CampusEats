/**
 * Dynamically loads the official Razorpay Checkout SDK script if not already present in the DOM.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

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
 * Initiates Razorpay payment popup for the given order details.
 * Resolves only when payment is completed and verified, or rejects/cancels.
 */
export async function initiateRazorpayPayment({
  amount,
  studentName = "CSJMU Student",
  studentRoll = "",
  phone = "+91 98765 43210",
  email = "student@csjmu.ac.in",
  notes = {}
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error("Unable to connect to Razorpay payment gateway. Check your internet connection.");
  }

  // 1. Create order on Next.js backend API
  const orderRes = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: Number(amount),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        studentName,
        studentRoll,
        ...notes
      }
    })
  });

  const orderData = await orderRes.json();
  if (!orderRes.ok || !orderData.success) {
    throw new Error(orderData.error || "Failed to initialize payment gateway.");
  }

  // 2. Open Razorpay Checkout modal
  return new Promise((resolve, reject) => {
    const options = {
      key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TmxSc9P6WVPBf7",
      amount: orderData.amount, // in paise
      currency: orderData.currency || "INR",
      name: "CSJMU Cafeteria",
      description: `Campus Dining Bill - Token Payment`,
      image: "https://lh3.googleusercontent.com/aida/AEtjO1Ue2iK4qEgYI5XQE6GNTZ4-tX9MvmKGqzC5uiR1PD-xWmeWWlnhqL1QL1BOFpe9wgiaXefHWMDb4V30p7m84TlaRr5gZGJ2XMPsgW5CmjD7e8dBIds4X8Yw8IvSwAPr-7AjinK9lguPJ2qc_8z6Bey6rTIDQZVfSiWNzr8l3mSLRBHK2NosHX1jFFkf6YYA6UlpSqtE8RuolF-A_pucXzRNnQKfocmJWFAp7411oYcJnoR7aqGPHCs8",
      order_id: orderData.orderId,
      prefill: {
        name: studentName,
        email: email,
        contact: phone.replace(/[^0-9]/g, "").slice(-10) || "9876543210"
      },
      theme: {
        color: "#a20513" // CSJMU brand maroon
      },
      modal: {
        ondismiss: () => {
          resolve({
            success: false,
            cancelled: true,
            message: "Payment window was closed by the student. Order was not placed."
          });
        }
      },
      handler: async function (response) {
        // 3. Verify payment signature on backend
        try {
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            resolve({
              success: true,
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
          } else {
            resolve({
              success: false,
              error: verifyData.error || "Payment signature verification failed."
            });
          }
        } catch (err) {
          resolve({
            success: false,
            error: err.message || "Failed to verify payment with server."
          });
        }
      }
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      console.warn("Payment failed:", response.error);
      resolve({
        success: false,
        error: response.error.description || "Payment failed at bank/gateway level."
      });
    });

    rzp.open();
  });
}
