import "server-only";

import crypto from "node:crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

export type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data: {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    currency: string;
    paid_at: string | null;
    metadata: Record<string, unknown>;
  };
};

/** Initializes a transaction server-side. Amount is in the major currency unit (Naira); Paystack expects kobo. */
export async function initializeTransaction(params: {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitializeResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${getSecretKey()}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amountNaira * 100),
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
    cache: "no-store",
  });

  const json = (await res.json()) as PaystackInitializeResponse;
  if (!res.ok || !json.status) {
    throw new Error(`Paystack initialize failed: ${json.message}`);
  }
  return json;
}

/** Verifies a transaction server-side. Never trust client-reported payment state — always confirm here. */
export async function verifyTransaction(
  reference: string,
): Promise<PaystackVerifyResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { authorization: `Bearer ${getSecretKey()}` },
      cache: "no-store",
    },
  );

  const json = (await res.json()) as PaystackVerifyResponse;
  if (!res.ok || !json.status) {
    throw new Error(`Paystack verify failed: ${json.message}`);
  }
  return json;
}

/** Validates the `x-paystack-signature` header on incoming webhook requests. */
export function isValidWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader) return false;
  const hash = crypto
    .createHmac("sha512", getSecretKey())
    .update(rawBody)
    .digest("hex");
  const hashBuffer = Buffer.from(hash);
  const signatureBuffer = Buffer.from(signatureHeader);
  if (hashBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, signatureBuffer);
}
