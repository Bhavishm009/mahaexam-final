import crypto from "crypto";

export function razorpayReady() {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function getRequired(name) {
  const v = process.env[name];
  if (!v && process.env.NODE_ENV === "production") {
    throw new Error(`${name}_MISSING`);
  }
  return v || "demo_secret";
}

export async function razorpayRequest(path, options = {}) {
  if (!razorpayReady()) {
    if (process.env.NODE_ENV !== "production") {
      return { id: `order_mock_${Date.now()}`, status: "created" };
    }
    throw new Error("RAZORPAY_NOT_CONFIGURED");
  }
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const r = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
      ...(options.headers || {}),
    },
  });
  const data = await r.json();
  if (!r.ok) {
    throw new Error(data?.error?.description || "RAZORPAY_REQUEST_FAILED");
  }
  return data;
}

export async function createRazorpayOrder({ amount, amountPaise, receipt, notes = {} }) {
  const finalPaise = amountPaise ?? Math.round(Number(amount || 0) * 100);
  if (!razorpayReady()) {
    return {
      id: `order_mock_${Date.now()}`,
      entity: "order",
      amount: finalPaise,
      amount_paid: 0,
      amount_due: finalPaise,
      currency: "INR",
      receipt: receipt || `rcpt_${Date.now()}`,
      status: "created",
      attempts: 0,
      notes,
      created_at: Math.floor(Date.now() / 1000),
    };
  }
  return razorpayRequest("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: finalPaise,
      currency: "INR",
      receipt,
      notes,
    }),
  });
}

export function verifyCheckoutSignature(orderId, paymentId, signature) {
  if (!razorpayReady() && process.env.NODE_ENV !== "production") {
    return true;
  }
  const secret = getRequired("RAZORPAY_KEY_SECRET");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return (
    expected.length === signature?.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ""))
  );
}

export function verifyRazorpaySignature(args) {
  if (!args) {
    return false;
  }
  if (typeof args === "object" && !Array.isArray(args)) {
    const { orderId, paymentId, signature } = args;
    return verifyCheckoutSignature(orderId, paymentId, signature);
  }
  return false;
}

export function verifyWebhookSignature(rawBody, signature) {
  if (!razorpayReady() && process.env.NODE_ENV !== "production") {
    return true;
  }
  const secret = getRequired("RAZORPAY_WEBHOOK_SECRET");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return (
    expected.length === signature?.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ""))
  );
}
