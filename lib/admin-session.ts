import { createHmac, timingSafeEqual } from "node:crypto";

// Minimal HMAC-signed session for the /admin dashboard — same pattern as
// lib/ebook-session.ts. A single shared password (ADMIN_PASSWORD) is
// proportionate here: this is a one-admin nonprofit site, not a multi-user
// system, so a full accounts/roles system would be over-engineering.

const COOKIE_NAME = "bt_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

type AdminSessionPayload = {
  isAdmin: true;
  exp: number;
};

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }
  return secret;
}

export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const provided = Buffer.from(password);
  const known = Buffer.from(expected);
  return provided.length === known.length && timingSafeEqual(provided, known);
}

export function signAdminSession(): string {
  const payload: AdminSessionPayload = { isAdmin: true, exp: Date.now() + SESSION_TTL_MS };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSession(value: string | undefined | null): boolean {
  if (!value) return false;

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return false;

  let expectedSignature: string;
  try {
    expectedSignature = createHmac("sha256", getSecret())
      .update(encodedPayload)
      .digest("base64url");
  } catch {
    return false;
  }

  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as AdminSessionPayload;
    return payload.isAdmin === true && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME, SESSION_TTL_MS as ADMIN_SESSION_TTL_MS };
