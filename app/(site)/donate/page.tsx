import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { DonateForm } from "@/components/DonateForm";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Belt of Truth Mentorship's work with young people across Kenya. Donate securely via M-Pesa, card, or bank transfer through Paystack.",
};

export default function DonatePage() {
  return (
    <>
      <PageHero
        title="Support the Movement"
        description="Your gift helps us reach more schools, churches, and communities with mentorship that changes lives."
      />

      <AnimatedSection className="px-5 py-16">
        <DonateForm />
      </AnimatedSection>
    </>
  );
}
