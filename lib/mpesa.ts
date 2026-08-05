// (mpesa-till-test branch: this comment only exists to give this branch a
// diff against main so a throwaway PR can be opened for a Vercel preview
// build — safe to ignore, this branch is never meant to be merged as-is.)
const MPESA_ENV = process.env.MPESA_ENV === "production" ? "production" : "sandbox";
const BASE_URL =
  MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

export const isMpesaConfigured = Boolean(
  process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_TILL_NUMBER &&
    process.env.MPESA_PASSKEY
);

// Deliberately separate from `isMpesaConfigured`: this lets the Till
// integration be built and tested end-to-end against Safaricom's sandbox
// without it ever appearing as a payment option on the live site, until
// NEXT_PUBLIC_MPESA_TILL_ENABLED is explicitly set to "true".
export const MPESA_TILL_ENABLED = process.env.NEXT_PUBLIC_MPESA_TILL_ENABLED === "true";

async function getAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa is not configured.");
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) {
    throw new Error(`Could not reach M-Pesa (${res.status}).`);
  }
  const data = await res.json();
  return data.access_token as string;
}

function daraTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    String(d.getFullYear()) +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

/** Kenyan phone numbers only, normalized to Safaricom's 2547XXXXXXXX / 2541XXXXXXXX format. */
export function normalizeKenyanPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (/^254(7|1)\d{8}$/.test(digits)) return digits;
  if (/^0(7|1)\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^(7|1)\d{8}$/.test(digits)) return `254${digits}`;
  return null;
}

type StkPushParams = {
  /** Already normalized via normalizeKenyanPhone. */
  phone: string;
  amountKes: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl: string;
};

type StkPushResponse = {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
};

export async function initiateStkPush({
  phone,
  amountKes,
  accountReference,
  transactionDesc,
  callbackUrl,
}: StkPushParams): Promise<StkPushResponse> {
  const shortCode = process.env.MPESA_TILL_NUMBER;
  const passkey = process.env.MPESA_PASSKEY;
  if (!shortCode || !passkey) {
    throw new Error("M-Pesa is not configured.");
  }

  const accessToken = await getAccessToken();
  const timestamp = daraTimestamp();
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      // Real Till numbers need "CustomerBuyGoodsOnline". Safaricom's public
      // sandbox test shortcode (174379) is provisioned as a PayBill on their
      // end, though, and rejects that with "Invalid TransactionType" — set
      // MPESA_TRANSACTION_TYPE=CustomerPayBillOnline when testing against it.
      TransactionType: process.env.MPESA_TRANSACTION_TYPE || "CustomerBuyGoodsOnline",
      Amount: Math.round(amountKes),
      PartyA: phone,
      PartyB: shortCode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      // Daraja hard-limits: AccountReference <= 12 chars, TransactionDesc <= 13 chars.
      AccountReference: accountReference.slice(0, 12),
      TransactionDesc: transactionDesc.slice(0, 13),
    }),
  });

  const data = await res.json();
  if (!res.ok || data.errorCode) {
    throw new Error(
      data.errorMessage || data.ResponseDescription || "Could not start the M-Pesa payment."
    );
  }
  return data;
}
