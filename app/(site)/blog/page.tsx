import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { TestimonyCard } from "@/components/TestimonyCard";
import { getTestimonies } from "@/lib/sanity/queries";
import { isSanityConfigured } from "@/lib/sanity/client";

export const metadata: Metadata = {
  title: "Stories & Testimonies",
  description:
    "Real stories of transformation from young people who have walked through Belt of Truth Mentorship programs.",
};

// Safety net for edits made directly in Sanity Studio — without this, a
// static page only picks up Sanity changes on the next deploy.
export const revalidate = 60;

export default async function BlogPage() {
  const testimonies = await getTestimonies();

  return (
    <>
      <PageHero
        title="Real Stories, Real Lives Changed"
        description="Testimonies from students and young people whose lives have been transformed through Belt of Truth Mentorship."
      />

      <AnimatedSection className="mx-auto max-w-6xl px-5 py-16">
        {testimonies.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonies.map((testimony) => (
              <TestimonyCard key={testimony._id} testimony={testimony} />
            ))}
          </div>
        ) : (
          <p className="mx-auto max-w-md text-center text-gray-500">
            {isSanityConfigured
              ? "No stories have been published yet — check back soon."
              : "Stories will appear here once content is added in the Sanity Studio at /studio."}
          </p>
        )}
      </AnimatedSection>
    </>
  );
}
