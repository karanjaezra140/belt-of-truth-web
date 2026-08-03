import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { isPaystackConfigured, verifyPaystackTransaction } from "@/lib/paystack";

export const metadata: Metadata = {
  title: "Thank You",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<{ reference?: string }>;
};

export default async function ThankYouPage({ searchParams }: Props) {
  const { reference } = await searchParams;

  let success = false;
  let amountKes: number | null = null;

  if (reference && isPaystackConfigured) {
    const verification = await verifyPaystackTransaction(reference);
    if (verification.status && verification.data?.status === "success") {
      success = true;
      amountKes = verification.data.amount / 100;
    }
  }

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 py-20 text-center">
      {success ? (
        <>
          <div className="mb-4 text-5xl">✅</div>
          <h1 className="font-display text-3xl font-bold text-navy-800">
            Thank You!
          </h1>
          <p className="mt-3 text-gray-600">
            {amountKes
              ? `We've received your payment of KSh ${amountKes.toLocaleString()}. `
              : "We've received your payment. "}
            We truly appreciate your support for Belt of Truth Mentorship.
          </p>
        </>
      ) : (
        <>
          <div className="mb-4 text-5xl">⏳</div>
          <h1 className="font-display text-3xl font-bold text-navy-800">
            Payment Pending
          </h1>
          <p className="mt-3 text-gray-600">
            We couldn&apos;t confirm your payment yet. If you completed
            checkout, it may still be processing —{" "}
            <Link href="/contact" className="font-medium text-navy-700 underline">
              contact us
            </Link>{" "}
            if this doesn&apos;t resolve shortly.
          </p>
        </>
      )}
      <Button href="/" variant="outlineNavy" className="mt-8">
        Back to Home
      </Button>
    </section>
  );
}
