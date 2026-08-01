import { HiOutlinePhotograph, HiOutlineVideoCamera } from "react-icons/hi";
import { EffectImage } from "./EffectImage";
import { cn, NOTCH } from "@/lib/utils";

type MediaSlotProps = {
  /** Static image URL — takes priority over videoSrc if both are given. */
  src?: string;
  /** Video URL — rendered muted/looping if no src is given. */
  videoSrc?: string;
  alt: string;
  /** Shown on the placeholder when neither src nor videoSrc is provided yet. */
  label: string;
  rounded?: string;
  className?: string;
};

// The "leave a slot" primitive: renders real media when it's available, and
// an intentional-looking placeholder (not a broken image) when it isn't —
// so unfilled sections still read as finished design while real photos and
// videos are pending.
export function MediaSlot({ src, videoSrc, alt, label, rounded = NOTCH, className }: MediaSlotProps) {
  if (src) {
    return (
      <EffectImage
        src={src}
        alt={alt}
        fill
        rounded={rounded}
        containerClassName={className}
      />
    );
  }

  if (videoSrc) {
    return (
      <div className={cn("relative overflow-hidden", rounded, className)}>
        <video
          src={videoSrc}
          muted
          loop
          playsInline
          autoPlay
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center gap-2 border-2 border-dashed border-navy-800/20 bg-navy-800/5 text-center",
        rounded,
        className
      )}
    >
      <div className="flex gap-2 text-3xl text-navy-800/30">
        <HiOutlinePhotograph />
        <HiOutlineVideoCamera />
      </div>
      <p className="max-w-[220px] px-4 text-xs font-medium uppercase tracking-wide text-navy-800/40">
        Photo or video coming soon — {label}
      </p>
    </div>
  );
}
