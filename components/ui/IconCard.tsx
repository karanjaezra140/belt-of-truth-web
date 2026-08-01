import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconCardProps = {
  emoji?: string;
  title: string;
  children?: ReactNode;
  variant?: "top-gold" | "left-navy" | "left-gold" | "circle";
  className?: string;
};

const VARIANTS = {
  "top-gold": "border-t-[3px] border-t-gold-500",
  "left-navy": "border-l-4 border-l-navy-800 text-left",
  "left-gold": "border-l-4 border-l-gold-500 text-left",
  circle: "text-center",
} as const;

export function IconCard({
  emoji,
  title,
  children,
  variant = "top-gold",
  className,
}: IconCardProps) {
  if (variant === "circle") {
    return (
      <div
        className={cn(
          "rounded-xl bg-white p-6 text-center shadow-[0_3px_12px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,0,0,0.1)]",
          className
        )}
      >
        {emoji && (
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold-500 bg-gold-500/10 text-2xl">
            {emoji}
          </span>
        )}
        <h3 className="mb-1.5 text-lg font-semibold text-navy-800">{title}</h3>
        {children && (
          <div className="text-[15px] leading-relaxed text-gray-600">{children}</div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-white p-6 shadow-[0_3px_12px_rgba(0,0,0,0.07)] transition-transform duration-200 hover:-translate-y-1",
        VARIANTS[variant],
        className
      )}
    >
      <h3 className="mb-1.5 flex items-center gap-2 text-lg font-semibold text-navy-800">
        {emoji && <span className="text-xl">{emoji}</span>}
        {title}
      </h3>
      {children && <div className="text-[15px] leading-relaxed text-gray-600">{children}</div>}
    </div>
  );
}
