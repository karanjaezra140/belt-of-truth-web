import { NextResponse } from "next/server";
import { sanityWriteClient } from "@/lib/sanity/client";

// Polled by the browser after an STK push is initiated — there's no
// redirect flow like Paystack's, so the client checks back here until the
// callback (app/api/mpesa/callback/route.ts) records a final status.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkoutRequestId = searchParams.get("checkoutRequestId");

  if (!checkoutRequestId || !sanityWriteClient) {
    return NextResponse.json({ status: "pending" });
  }

  const pending = await sanityWriteClient.fetch<{ status: string } | null>(
    `*[_type == "mpesaTransaction" && checkoutRequestId == $id][0]{status}`,
    { id: checkoutRequestId }
  );

  return NextResponse.json({ status: pending?.status ?? "pending" });
}
