import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { IconCard } from "@/components/ui/IconCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { CTASection } from "@/components/ui/CTASection";
import { FOCUS_AREAS } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/sanity/queries";

export default async function HomePage() {
  const { heroStats } = await getSiteSettings();

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden text-left">
        <Image
          src="/images/school_visit.jpeg"
          alt="Belt of Truth mentors engaging with students at a school visit"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/55 to-navy-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-28 md:px-12">
          <span className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-gold-500/55 bg-gold-500/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[2.5px] text-gold-500">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            Belt of Truth · Youth Transformation
          </span>

          <h1 className="font-display max-w-xl text-4xl font-black leading-[1.08] text-white md:text-6xl">
            Raising a Generation Rooted in{" "}
            <em className="not-italic text-gold-500">Truth</em> and Purpose
          </h1>

          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/85 md:text-lg">
            Empowering young people across Kenya to overcome destructive
            habits, find their voice, and live impactful, God-centred lives.
          </p>

          <div className="mt-11 flex w-fit flex-wrap overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm">
            {(heroStats ?? []).map((stat, i, arr) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center gap-1 px-9 py-5 ${
                  i < arr.length - 1 ? "border-r border-white/10" : ""
                }`}
              >
                <div className="font-display text-3xl font-bold text-gold-500 md:text-4xl">
                  {stat.number}
                </div>
                <div className="mt-0.5 h-0.5 w-6 bg-gold-500/50" />
                <div className="max-w-[110px] text-center text-xs leading-snug text-white/75">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-11 flex flex-wrap gap-3.5">
            <Button href="/contact">Join the Movement →</Button>
            <Button href="/resources" variant="outline">
              Explore Resources →
            </Button>
          </div>
        </div>
      </section>

      {/* GOLD STRIP */}
      <div className="bg-gold-500 px-6 py-4 text-center text-sm font-semibold tracking-wide text-navy-950">
        ✦ Real Stories. Real Lives Changed.
        <span className="mx-3.5 opacity-45">|</span>
        &ldquo;This programme saved my life.&rdquo; — Student, Nakuru
        <span className="mx-3.5 opacity-45">|</span>
        20+ Transformation Testimonies and counting ✦
      </div>

      {/* FOCUS AREAS */}
      <AnimatedSection className="mx-auto max-w-6xl px-5 py-16 text-center">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[2.5px] text-gold-500">
          what we address.
        </span>
        <h2 className="font-display text-3xl font-bold text-navy-800">
          Our Focus Areas
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {FOCUS_AREAS.map((area) => (
            <IconCard
              key={area.title}
              emoji={area.emoji}
              title={area.title}
              variant="circle"
            />
          ))}
        </div>
      </AnimatedSection>

      {/* ABOUT TEASER */}
      <AnimatedSection className="bg-white px-5 py-16 text-center">
        <div className="mx-auto max-w-xl">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[2.5px] text-gold-500">
            who we are.
          </span>
          <h2 className="font-display text-3xl font-bold text-navy-800">
            Who We Are
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-gray-600">
            Belt of Truth Mentorship is a Christ-centred organisation
            dedicated to walking alongside young people — helping them break
            destructive habits, discover their God-given purpose, and live
            with integrity and impact.
          </p>
          <Button href="/about" className="mt-6">
            Learn More About Us →
          </Button>
        </div>
      </AnimatedSection>

      <CTASection
        title="Ready to Start Your Journey?"
        description="Take the first step toward transformation and purpose."
        buttonLabel="Join Now"
        buttonHref="/contact"
      />
    </>
  );
}
