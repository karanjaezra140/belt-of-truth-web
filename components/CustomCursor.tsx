"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// A soft highlight that trails the mouse and grows over interactive
// elements — the "highlighter" effect from the reference site. Hidden
// entirely on touch devices via the [@media(pointer:fine)] class below
// (see the matching `cursor: none` rule in globals.css), so touch and
// keyboard-only navigation are never affected.
export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { damping: 28, stiffness: 320, mass: 0.4 });
  const springY = useSpring(y, { damping: 28, stiffness: 320, mass: 0.4 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
    }
    function handleOver(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      setHovering(Boolean(target?.closest("a, button, [role='button'], summary")));
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseover", handleOver);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
    };
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      // The white ring is the guaranteed-visible layer — mix-blend-mode is
      // unreliable over images/video (they're commonly GPU-composited on
      // their own layer, e.g. via EffectImage's hover-scale transform, which
      // can stop the blend from applying against them at all). The gold
      // blend fill on top is a decorative bonus where blending does work.
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden rounded-full shadow-[0_0_0_1.5px_rgba(255,255,255,0.9),0_0_10px_rgba(0,0,0,0.35)] [@media(pointer:fine)]:block"
      style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
      animate={{ width: hovering ? 56 : 18, height: hovering ? 56 : 18 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="h-full w-full rounded-full mix-blend-difference bg-gold-500" />
    </motion.div>
  );
}
