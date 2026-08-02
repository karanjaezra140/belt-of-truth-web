import { Button } from "./Button";
import { AnimatedSection } from "./AnimatedSection";
import { NOTCH_ALT } from "@/lib/utils";

type CTASectionProps = {
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function CTASection({
  title,
  description,
  buttonLabel,
  buttonHref,
  secondaryLabel,
  secondaryHref,
}: CTASectionProps) {
  return (
    <div className="px-5 py-12 md:py-16">
      <AnimatedSection
        className={`mx-auto max-w-5xl bg-gradient-to-br from-navy-800 to-navy-700 px-6 py-16 text-center text-white shadow-xl transition-shadow duration-500 hover:shadow-[0_0_50px_rgba(212,175,55,0.25)] ${NOTCH_ALT}`}
      >
        <h2 className="font-display text-3xl font-bold">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/85">{description}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button href={buttonHref}>{buttonLabel}</Button>
          {secondaryLabel && secondaryHref && (
            <Button href={secondaryHref} variant="outline">
              {secondaryLabel}
            </Button>
          )}
        </div>
      </AnimatedSection>
    </div>
  );
}
