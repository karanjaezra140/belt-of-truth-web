import Link from "next/link";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { HiOutlineArrowRight } from "react-icons/hi";
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
  /** Hide the leading circular arrow badge — for rare cases where it doesn't fit. */
  hideIcon?: boolean;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  className,
  hideIcon = false,
  href,
  children,
  ...props
}: ButtonBaseProps &
  (
    | ({ href: string } & ComponentPropsWithoutRef<typeof Link>)
    | ({ href?: undefined } & ComponentPropsWithoutRef<"button">)
  )) {
  const classes = cn(
    "inline-flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-6 font-semibold text-[15px] transition-all duration-200 hover:-translate-y-0.5",
    VARIANTS[variant],
    className
  );

  const content = (
    <>
      {!hideIcon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-current">
          <HiOutlineArrowRight className="text-base" />
        </span>
      )}
      {children}
    </>
  );

  if (href) {
    const linkProps = {
      href,
      className: classes,
      children: content,
      ...props,
    } as ComponentPropsWithoutRef<typeof Link>;
    return <Link {...linkProps} />;
  }

  const Comp = "button" as ElementType;
  return (
    <Comp className={classes} {...(props as ComponentPropsWithoutRef<"button">)}>
      {content}
    </Comp>
  );
}
