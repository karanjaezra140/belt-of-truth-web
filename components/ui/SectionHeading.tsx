import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      {eyebrow && (
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[2.5px] text-gold-500">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-bold text-navy-800 md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
          {description}
        </p>
      )}
    </div>
  );
}
