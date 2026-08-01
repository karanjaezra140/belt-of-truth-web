import type { ReactNode } from "react";

type PageHeroProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageHero({ title, description, children }: PageHeroProps) {
  return (
    <section className="bg-gradient-to-br from-navy-800 via-navy-600 to-[#0b5394] px-5 py-16 text-center text-white md:py-20">
      <h1 className="font-display mx-auto max-w-3xl text-3xl font-bold leading-snug md:text-5xl">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-white/90">{description}</p>
      {children}
    </section>
  );
}
