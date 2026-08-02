import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconCard } from "@/components/ui/IconCard";
import { EffectImage } from "@/components/ui/EffectImage";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { CTASection } from "@/components/ui/CTASection";
import { FOUNDER } from "@/lib/site-config";
import { getCoreValues } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "About",
  description:
    "Belt of Truth Mentorship empowers youth to overcome destructive habits and live purposeful, Christ-centered lives through mentorship, accountability, and biblical truth.",
};

// Safety net for edits made directly in Sanity Studio — without this, a
// static page only picks up Sanity changes on the next deploy.
export const revalidate = 60;

export default async function AboutPage() {
  const coreValues = await getCoreValues();

  return (
    <>
      <PageHero
        title="About Us"
        description="Belt of Truth Mentorship empowers youth to overcome destructive habits and live purposeful, Christ-centered lives through mentorship, accountability, and biblical truth."
      />

      <AnimatedSection className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading eyebrow="what we believe." title="Our Core Values" />
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coreValues.map((value) => (
            <IconCard
              key={value._id}
              title={value.title}
              variant="left-navy"
            >
              {value.description}
            </IconCard>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection className="mx-auto max-w-6xl px-5 pb-16">
        <SectionHeading eyebrow="meet the visionary." title="Our Founder" className="mb-8" />
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 md:flex-row md:items-start md:text-left">
          <EffectImage
            src={FOUNDER.photo}
            alt={`${FOUNDER.name}, founder of Belt of Truth Mentorship`}
            width={180}
            height={180}
            rounded="rounded-full"
            containerClassName="h-[180px] w-[180px] shrink-0 border-4 border-gold-500 shadow-lg"
            hideIcon
          />
          <div className="text-center md:text-left">
            <p className="mb-3.5 text-[17px] font-semibold text-navy-800">
              {FOUNDER.name}
            </p>
            {FOUNDER.bio.map((paragraph, i) => (
              <p
                key={i}
                className="mb-3.5 text-[15px] leading-relaxed text-gray-600"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <CTASection
        title="Want to Partner With Us?"
        description="We welcome mentors, volunteers, and organizations who share our vision."
        buttonLabel="Get in Touch"
        buttonHref="/contact"
      />
    </>
  );
}
