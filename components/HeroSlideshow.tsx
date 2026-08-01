"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

type HeroSlideshowProps = {
  images: string[];
  alt: string;
  intervalMs?: number;
};

// Auto-rotating crossfade background — used on the homepage hero once one or
// more photos are uploaded in Sanity (Site Settings → "Homepage — rotating
// hero photos"). Falls back to a single static image when none are set (see
// app/page.tsx), so this never needs to handle an empty array itself.
export function HeroSlideshow({ images, alt, intervalMs = 6000 }: HeroSlideshowProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <AnimatePresence>
      <motion.div
        key={images[index]}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <Image src={images[index]} alt={alt} fill priority={index === 0} className="object-cover" />
      </motion.div>
    </AnimatePresence>
  );
}
