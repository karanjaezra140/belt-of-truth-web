import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { CTASection } from "@/components/ui/CTASection";
import { NOTCH } from "@/lib/utils";
import { getPrograms } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "School and campus missions, church youth mentorship, community outreach, habit transformation, and one-on-one mentorship programs from Belt of Truth Mentorship.",
};

// Safety net for edits made directly in Sanity Studio — without this, a
// static page only picks up Sanity changes on the next deploy.
export const revalidate = 60;

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
          {programs.map((program) => {
            const photoUrl = program.image
              ? urlFor(program.image)?.width(600).height(450).fit("crop").url()
              : undefined;
            return (
              <div key={program._id} className={`relative aspect-[4/3] overflow-hidden ${NOTCH}`}>
                <MediaSlot
                  src={photoUrl}
                  alt={program.title}
                  label={program.title}
                  caption={`${program.emoji ? `${program.emoji} ` : ""}${program.title}`}
                  captionDescription={program.description}
                  className="absolute inset-0"
                  rounded=""
                />
              </div>
            );
          })}
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
