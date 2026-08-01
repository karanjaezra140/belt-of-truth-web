import { Button } from "./Button";
import { MediaSlot } from "./MediaSlot";
import { NOTCH } from "@/lib/utils";

type PhotoCTAProps = {
  eyebrow: string;
  title: string;
  buttonLabel: string;
  buttonHref: string;
  mediaAlt: string;
  mediaLabel: string;
  mediaSrc?: string;
};

// Photo-backed CTA banner matching the reference site's "Become a Volunteer"
// pattern: full-bleed photo, dark scrim for legibility, eyebrow + heading on
// one side, a pill button floating on the other.
export function PhotoCTA({
  eyebrow,
  title,
  buttonLabel,
  buttonHref,
  mediaAlt,
  mediaLabel,
  mediaSrc,
}: PhotoCTAProps) {
  return (
    <div className="px-5 py-12 md:py-16">
      <div className={`relative mx-auto min-h-[300px] max-w-5xl overflow-hidden ${NOTCH}`}>
        <MediaSlot
          src={mediaSrc}
          alt={mediaAlt}
          label={mediaLabel}
          className="absolute inset-0"
          rounded=""
          hideIcon
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/55 to-navy-950/10" />
        <div className="relative z-10 flex h-full min-h-[300px] flex-col items-start justify-center gap-8 px-8 py-12 md:flex-row md:items-center md:justify-between md:px-12">
          <div className="max-w-md">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[2.5px] text-gold-500">
              {eyebrow}
            </span>
            <h2 className="font-display text-3xl font-bold leading-snug text-white md:text-4xl">
              {title}
            </h2>
          </div>
          <Button href={buttonHref}>{buttonLabel} →</Button>
        </div>
      </div>
    </div>
  );
}
