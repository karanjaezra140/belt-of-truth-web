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
};

export function EffectImage({
  rounded = NOTCH,
  containerClassName,
  imageClassName,
  hideIcon = false,
  alt,
  ...imageProps
}: EffectImageProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden",
        rounded,
        containerClassName
      )}
    >
      <Image
        alt={alt}
        {...imageProps}
        className={cn(
          "h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110",
          imageClassName
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-navy-950/0 transition-colors duration-500 group-hover:bg-navy-950/40" />
      {!hideIcon && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 scale-0 items-center justify-center rounded-full bg-gold-500 text-navy-950 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
            <HiOutlinePlus className="text-2xl" />
          </span>
        </div>
      )}
    </div>
  );
}
