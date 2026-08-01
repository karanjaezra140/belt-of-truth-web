import { createHmac, timingSafeEqual } from "node:crypto";

// Minimal HMAC-signed session token for the protected ebook reader — mirrors
// the raw node:crypto HMAC pattern already used to verify Paystack's webhook
// signature (see app/api/paystack/webhook/route.ts). No JWT library needed
// for a payload this small.

export type EbookSessionPayload = {
  accessId: string;
  bookId: string;
  exp: number; // unix ms
};

function getSecret(): string {
  const secret = process.env.EBOOK_SESSION_SECRET;
  if (!secret) {
    throw new Error("EBOOK_SESSION_SECRET is not configured");
  }
  return secret;
}

export function signSession(payload: EbookSessionPayload): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifySession(value: string | undefined | null): EbookSessionPayload | null {
  if (!value) return null;

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return null;

  let expectedSignature: string;
  try {
    expectedSignature = createHmac("sha256", getSecret())
      .update(encodedPayload)
      .digest("base64url");
  } catch {
    return null;
  }

  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as EbookSessionPayload;

    if (
      typeof payload.accessId !== "string" ||
      typeof payload.bookId !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function ebookCookieName(bookId: string): string {
  return `bt_access_${bookId}`;
}

export function isEbookAccessLive(access: {
  book: { _id: string };
  revoked: boolean;
  expiresAt: string;
}): boolean {
  return !access.revoked && new Date(access.expiresAt).getTime() > Date.now();
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}${"*".repeat(Math.max(3, user.length - visible.length))}@${domain}`;
}
