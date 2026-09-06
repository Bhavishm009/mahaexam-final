import crypto from "crypto";

export function razorpayReady() {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export async function createRazorpayOrder({ amountPaise, receipt, notes = {} }) {
  if (amountPaise < 100) {
    throw new Error("MINIMUM_AMOUNT_REQUIRED: Amount must be at least 100 paise (₹1)");
  }
  if (!razorpayReady()) {
    throw new Error("RAZORPAY_NOT_CONFIGURED");
  }
  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, notes }),
  });
  if (!response.ok) {
    throw new Error(`RAZORPAY_ORDER_FAILED:${await response.text()}`);
  }
  return response.json();
}

export function verifyCheckoutSignature(orderId, paymentId, signature) {
  if (!orderId || !paymentId || !signature) {
    return false;
  }
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("RAZORPAY_KEY_SECRET_MISSING");
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return (
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  );
}

export function verifyWebhookSignature(rawBody, signature) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
    .update(rawBody)
    .digest("hex");
  return (
    expected.length === signature?.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  );
}
