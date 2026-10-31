/**
 * Loads the Razorpay Checkout JavaScript SDK dynamically
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initiates Razorpay Payment in Test Mode
 * @param {Object} options Payment details
 * @param {number} options.amount Amount in INR
 * @param {string} options.orderId Optional backend order ID
 * @param {Object} options.prefill User information
 * @param {Function} options.onSuccess Success callback
 * @param {Function} options.onFailure Failure callback
 */
export const openRazorpayPayment = async ({
  amount,
  orderId = `ORD_${Date.now()}`,
  description = "SmartBite Canteen Order",
  prefill = { name: "Canteen Student", email: "student@smartbite.com", contact: "9999999999" },
  onSuccess,
  onFailure
}) => {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded) {
    onFailure && onFailure(new Error("Razorpay SDK failed to load. Check your internet connection."));
    return;
  }

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

  const options = {
    key: razorpayKey,
    amount: Math.round(amount * 100), // In paise
    currency: "INR",
    name: "SmartBite Canteen",
    description,
    image: "/logo/logo.png",
    order_id: orderId.startsWith("order_") ? orderId : undefined,
    handler: function (response) {
      if (onSuccess) {
        onSuccess({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id || orderId,
          signature: response.razorpay_signature
        });
      }
    },
    prefill: {
      name: prefill.name || "Student User",
      email: prefill.email || "student@smartbite.com",
      contact: prefill.contact || "9999999999"
    },
    notes: {
      address: "Campus Canteen Counter"
    },
    theme: {
      color: "#ea580c"
    },
    modal: {
      ondismiss: function () {
        onFailure && onFailure(new Error("Payment cancelled by user."));
      }
    }
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};

