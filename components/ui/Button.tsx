import Link from "next/link";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary:
    "bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-sm hover:shadow-md",
  outline:
    "bg-transparent text-white border border-white/45 hover:border-gold-500 hover:text-gold-500",
  outlineNavy:
    "bg-transparent text-navy-800 border-2 border-navy-800 hover:bg-navy-800 hover:text-white",
} as const;

type Variant = keyof typeof VARIANTS;

type ButtonBaseProps = {
  variant?: Variant;
  className?: string;
};

export function Button({
  variant = "primary",
  className,
  href,
  ...props
}: ButtonBaseProps &
  (
    | ({ href: string } & ComponentPropsWithoutRef<typeof Link>)
    | ({ href?: undefined } & ComponentPropsWithoutRef<"button">)
  )) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold text-[15px] transition-all duration-200 hover:-translate-y-0.5",
    VARIANTS[variant],
    className
  );

  if (href) {
    const linkProps = {
      href,
      className: classes,
      ...props,
    } as ComponentPropsWithoutRef<typeof Link>;
    return <Link {...linkProps} />;
  }

  const Comp = "button" as ElementType;
  return (
    <Comp className={classes} {...(props as ComponentPropsWithoutRef<"button">)} />
  );
}
