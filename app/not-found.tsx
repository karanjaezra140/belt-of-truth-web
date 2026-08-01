import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 py-20 text-center">
      <span className="font-display text-6xl font-black text-gold-500">404</span>
      <h1 className="font-display mt-4 text-3xl font-bold text-navy-800">
        Page Not Found
      </h1>
      <p className="mt-3 text-gray-600">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">Back to Home</Button>
        <Button href="/contact" variant="outlineNavy">
          Contact Us
        </Button>
      </div>
    </section>
  );
}
