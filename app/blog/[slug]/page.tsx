import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { CTASection } from "@/components/ui/CTASection";
import { EffectImage } from "@/components/ui/EffectImage";
import { getTestimonies, getTestimonyBySlug } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const testimonies = await getTestimonies();
  return testimonies.map((testimony) => ({ slug: testimony.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const testimony = await getTestimonyBySlug(slug);
  if (!testimony) return {};

  return {
    title: testimony.title,
    description: testimony.excerpt,
  };
}

export default async function TestimonyPage({ params }: Props) {
  const { slug } = await params;
  const testimony = await getTestimonyBySlug(slug);

  if (!testimony) notFound();

  const imageUrl = testimony.coverImage
    ? urlFor(testimony.coverImage)?.width(1200).height(600).fit("crop").url()
    : null;

  return (
    <>
      <article className="mx-auto max-w-3xl px-5 py-16">
        <Link href="/blog" className="text-sm font-medium text-navy-700 hover:underline">
          ← Back to Stories
        </Link>

        {testimony.programTag && (
          <span className="mb-3 mt-6 inline-block w-fit rounded-full bg-gold-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-600">
            {testimony.programTag}
          </span>
        )}

        <h1 className="font-display mt-2 text-3xl font-bold text-navy-800 md:text-4xl">
          {testimony.title}
        </h1>
        <p className="mt-3 text-sm text-gray-500">— {testimony.authorName}</p>

        {imageUrl && (
          <EffectImage
            src={imageUrl}
            alt={testimony.title}
            fill
            containerClassName="relative mt-8 aspect-video w-full"
            hideIcon
          />
        )}

        <p className="mt-8 text-lg leading-relaxed text-gray-700 italic">
          &ldquo;{testimony.excerpt}&rdquo;
        </p>

        {testimony.body && testimony.body.length > 0 && (
          <div className="prose prose-neutral mt-8 max-w-none prose-headings:font-display prose-headings:text-navy-800 prose-a:text-navy-700">
            <PortableText value={testimony.body} />
          </div>
        )}
      </article>

      <CTASection
        title="Have a Story to Share?"
        description="If Belt of Truth has been part of your journey, we'd love to hear from you."
        buttonLabel="Get in Touch"
        buttonHref="/contact"
      />
    </>
  );
}
