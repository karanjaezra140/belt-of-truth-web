"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

type AnimatedCounterProps = {
  /** e.g. "2,000+", "50+" — digits are animated, surrounding characters are preserved. */
  value: string;
  className?: string;
};

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(() => format(0, value));

  useEffect(() => {
    if (!inView) return;
    const target = Number(value.replace(/[^0-9]/g, "")) || 0;
    const controls = animate(0, target, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(format(Math.round(latest), value)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref} className={className}>{display}</span>;
}

function format(n: number, template: string): string {
  const prefix = template.match(/^\D*/)?.[0] ?? "";
  const suffix = template.match(/\D*$/)?.[0] ?? "";
  return `${prefix}${n.toLocaleString()}${suffix}`;
}
