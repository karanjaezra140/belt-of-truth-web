"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { HiOutlinePlus } from "react-icons/hi";
import { cn, NOTCH } from "@/lib/utils";

type EffectImageProps = Omit<ImageProps, "className"> & {
  /** Override the corner treatment — defaults to the notch shape, pass "rounded-full" for portraits. */
  rounded?: string;
  containerClassName?: string;
  imageClassName?: string;
  /** Hide the centered icon reveal — useful for small thumbnails. */
  hideIcon?: boolean;
  /** Title shown over the photo; if set, replaces the centered "+" reveal with a bottom caption that fades/slides in on hover. */
  caption?: string;
  captionDescription?: string;
  /** Keep the caption visible at all times instead of only on hover — for scannable tile grids (e.g. Focus Areas) rather than discoverable detail cards. */
  captionAlwaysVisible?: boolean;
};

export function EffectImage({
  rounded = NOTCH,
  containerClassName,
  imageClassName,
  hideIcon = false,
  caption,
  captionDescription,
  captionAlwaysVisible = false,
  alt,
  ...imageProps
}: EffectImageProps) {
  // :hover doesn't map to a "press to reveal, release to restore" gesture on
  // touch devices, so track the press explicitly and mirror every
  // group-hover: class with a real class while pressed.
  const [pressed, setPressed] = useState(false);
  const clearPressed = () => setPressed(false);

  return (
    <div
      className={cn("group relative overflow-hidden", rounded, containerClassName)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={clearPressed}
      onPointerLeave={clearPressed}
      onPointerCancel={clearPressed}
    >
      <Image
        alt={alt}
        {...imageProps}
        className={cn(
          "h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110",
          pressed && "scale-110",
          imageClassName
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-navy-950/0 transition-colors duration-500 group-hover:bg-navy-950/40",
          pressed && "bg-navy-950/40"
        )}
      />

      {caption ? (
        <>
          {captionAlwaysVisible && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy-950/85 via-navy-950/25 to-transparent" />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 sm:p-5">
            <h3
              className={cn(
                "font-display text-lg font-bold text-white transition-all duration-300",
                captionAlwaysVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
                !captionAlwaysVisible && pressed && "translate-y-0 opacity-100"
              )}
            >
              {caption}
            </h3>
            {captionDescription && (
              <p
                className={cn(
                  "mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/85 transition-all delay-75 duration-300",
                  captionAlwaysVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
                  !captionAlwaysVisible && pressed && "translate-y-0 opacity-100"
                )}
              >
                {captionDescription}
              </p>
            )}
          </div>
        </>
      ) : (
        !hideIcon && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                "flex h-12 w-12 scale-0 items-center justify-center rounded-full bg-gold-500 text-navy-950 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100",
                pressed && "scale-100 opacity-100"
              )}
            >
              <HiOutlinePlus className="text-2xl" />
            </span>
          </div>
        )
      )}
    </div>
  );
}
