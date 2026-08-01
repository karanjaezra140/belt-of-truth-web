const PAYSTACK_BASE_URL = "https://api.paystack.co";

export const isPaystackConfigured = Boolean(process.env.PAYSTACK_SECRET_KEY);

type InitializeParams = {
  email: string;
  amountKes: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
};

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: { authorization_url: string; access_code: string; reference: string };
};

export async function initializePaystackTransaction({
  email,
  amountKes,
  reference,
  callbackUrl,
  metadata,
}: InitializeParams): Promise<PaystackInitializeResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Paystack is not configured. Set PAYSTACK_SECRET_KEY in your environment."
    );
  }

  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amountKes * 100), // Paystack expects the subunit (cents)
      currency: "KES",
      reference,
      callback_url: callbackUrl,
      metadata,
    }),
  });

  return res.json();
}

export type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    currency: string;
    paid_at: string | null;
    customer: { email: string };
    metadata: Record<string, unknown>;
  };
};

export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Paystack is not configured. Set PAYSTACK_SECRET_KEY in your environment."
    );
  }

  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey}` },
    }
  );

  return res.json();
}
