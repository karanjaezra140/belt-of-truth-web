import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconCard } from "@/components/ui/IconCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { CTASection } from "@/components/ui/CTASection";
import { BookCard } from "@/components/BookCard";
import { FREE_RESOURCES } from "@/lib/site-config";
import { getBooks } from "@/lib/sanity/queries";
import { isSanityConfigured } from "@/lib/sanity/client";

export const metadata: Metadata = {
  title: "Resources & Books",
  description:
    "Tools, guides, and books to support your journey toward truth, purity, and purpose — from Belt of Truth Mentorship.",
};

export default async function ResourcesPage() {
  const books = await getBooks();

  return (
    <>
      <PageHero
        title="Resources & Books"
        description="Tools, guides, and books to support your journey toward truth, purity, and purpose."
      />

      <AnimatedSection className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading eyebrow="at no cost." title="Free Resources" />
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {FREE_RESOURCES.map((resource) => (
            <IconCard
              key={resource.title}
              emoji={resource.emoji}
              title={resource.title}
              variant="circle"
            >
              {resource.description}
            </IconCard>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-white px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="go deeper."
            title="Our Books"
            description="Each book is written to equip young people with biblical wisdom and practical tools for real life."
          />
          <div className="mt-8">
            {books.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {books.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            ) : (
              <p className="mx-auto max-w-md text-center text-gray-500">
                {isSanityConfigured
                  ? "No books have been published yet — check back soon."
                  : "Books will appear here once added in the Sanity Studio at /studio."}
              </p>
            )}
          </div>
        </div>
      </AnimatedSection>

      <CTASection
        title="Need Help Ordering?"
        description="Contact us directly and we will assist you with your purchase."
        buttonLabel="Contact Us"
        buttonHref="/contact"
      />
    </>
  );
}
