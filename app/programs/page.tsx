import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconCard } from "@/components/ui/IconCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { CTASection } from "@/components/ui/CTASection";
import { getPrograms } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "School and campus missions, church youth mentorship, community outreach, habit transformation, and one-on-one mentorship programs from Belt of Truth Mentorship.",
};

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <>
      <PageHero
        title="Programs | What We Do"
        description="Walking with young people toward purpose, discipline, and Christ-centered living through practical mentorship."
      />

      <AnimatedSection className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading eyebrow="how we help." title="What Makes Us Different" />
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <IconCard
              key={program._id}
              emoji={program.emoji}
              title={program.title}
              variant="circle"
            >
              {program.description}
            </IconCard>
          ))}
        </div>
      </AnimatedSection>

      <CTASection
        title="Ready to Get Involved?"
        description="Take the next step toward transformation and purpose."
        buttonLabel="Join a Program"
        buttonHref="/contact"
      />
    </>
  );
}
