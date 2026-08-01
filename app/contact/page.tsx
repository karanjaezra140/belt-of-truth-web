import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { SocialLinks } from "@/components/SocialLinks";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach out to Belt of Truth Mentorship to join our mentorship programs, volunteer, or partner with us.",
};

export default function ContactPage() {
  return (
    <>
      <section className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-navy-800 md:text-4xl">
          Contact Us
        </h1>
        <p className="mt-3 text-gray-600">
          Reach out to join our mentorship programs, volunteer, or partner
          with us.
        </p>
      </section>

      <AnimatedSection className="px-5 pb-16">
        <ContactForm />
      </AnimatedSection>

      <AnimatedSection className="px-5 pb-20">
        <h3 className="mb-4 text-center text-xl font-semibold text-navy-800">
          Connect With Us
        </h3>
        <SocialLinks />
      </AnimatedSection>
    </>
  );
}
