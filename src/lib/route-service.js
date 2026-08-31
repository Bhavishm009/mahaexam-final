import crypto from "crypto";

function authHeader() {
  return (
    "Basic " +
    Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString(
      "base64",
    )
  );
}
export function routeReady() {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export async function createLinkedAccount({
  name,
  email,
  contact,
  bankAccountNumber,
  ifsc,
  beneficiaryName,
}) {
  if (!routeReady()) {
    throw new Error("RAZORPAY_NOT_CONFIGURED");
  }
  const r = await fetch("https://api.razorpay.com/v2/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader() },
    body: JSON.stringify({
      email,
      name,
      contact,
      type: "route",
      legal_business_name: name,
      profile: { category: "education", subcategory: "educational_services" },
      legal_info: { pan: process.env.DEFAULT_LINKED_ACCOUNT_PAN || undefined },
      notes: { platform: "MahaExam" },
      bank_account: { account_number: bankAccountNumber, ifsc, beneficiary_name: beneficiaryName },
    }),
  });
  if (!r.ok) {
    throw new Error(`ROUTE_LINKED_ACCOUNT_FAILED:${await r.text()}`);
  }
  return r.json();
}

export async function createTransferFromPayment({ paymentId, accountId, amountPaise, notes = {} }) {
  if (!routeReady()) {
    throw new Error("RAZORPAY_NOT_CONFIGURED");
  }
  const r = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/transfers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader() },
    body: JSON.stringify({
      transfers: [
        {
          account: accountId,
          amount: amountPaise,
          currency: "INR",
          notes,
          on_hold: false,
        },
      ],
    }),
  });
  if (!r.ok) {
    throw new Error(`ROUTE_TRANSFER_FAILED:${await r.text()}`);
  }
  return r.json();
}

export function verifyRouteWebhook(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return (
    !!signature &&
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  );
}
