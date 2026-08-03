import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaSlot } from "@/components/ui/MediaSlot";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { CTASection } from "@/components/ui/CTASection";
import { BookCard } from "@/components/BookCard";
import { HiChevronDown } from "react-icons/hi";
import { NOTCH } from "@/lib/utils";
import { FAQS } from "@/lib/site-config";
import { getBooks, getFreeResources } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { isSanityConfigured } from "@/lib/sanity/client";

export const metadata: Metadata = {
  title: "Resources & Books",
  description:
    "Tools, guides, and books to support your journey toward truth, purity, and purpose — from Belt of Truth Mentorship.",
};

// Safety net for edits made directly in Sanity Studio — without this, a
// static page only picks up Sanity changes on the next deploy.
export const revalidate = 60;

export default async function ResourcesPage() {
  const [books, freeResources] = await Promise.all([getBooks(), getFreeResources()]);

  return (
    <>
      <PageHero
        title="Resources & Books"
        description="Tools, guides, and books to support your journey toward truth, purity, and purpose."
      />

      <AnimatedSection className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading eyebrow="at no cost." title="Free Resources" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {freeResources.map((resource) => {
            const photoUrl = resource.image
              ? urlFor(resource.image)?.width(500).height(400).fit("crop").url()
              : undefined;
            return (
              <div key={resource._id} className={`relative aspect-[5/4] overflow-hidden ${NOTCH}`}>
                <MediaSlot
                  src={photoUrl}
                  alt={resource.title}
                  label={resource.title}
                  caption={`${resource.emoji ? `${resource.emoji} ` : ""}${resource.title}`}
                  captionDescription={resource.description}
                  className="absolute inset-0"
                  rounded=""
                />
              </div>
            );
          })}
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

      <AnimatedSection className="mx-auto max-w-3xl px-5 py-16">
        <SectionHeading eyebrow="good to know." title="Frequently Asked Questions" />
        <div className="mt-8 space-y-3">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl bg-white p-5 shadow-[0_3px_12px_rgba(0,0,0,0.07)] [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-navy-800">
                {faq.question}
                <HiChevronDown className="shrink-0 text-lg text-gold-600 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-gray-600">{faq.answer}</p>
            </details>
          ))}
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
