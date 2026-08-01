"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { NAV_LINKS } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navy-800 shadow-lg shadow-black/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2 md:px-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo.png"
            alt="Belt of Truth Mentorship logo"
            width={64}
            height={64}
            className="h-14 w-auto object-contain"
            priority
          />
          <span className="font-display text-lg font-bold text-white">
            Belt of Truth
          </span>
        </Link>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="text-2xl text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <HiX /> : <HiMenu />}
        </button>

        <nav
          className={cn(
            "absolute left-0 top-full w-full flex-col bg-navy-800 pb-3 shadow-lg md:static md:flex md:w-auto md:flex-row md:items-center md:gap-1 md:bg-transparent md:pb-0 md:shadow-none",
            open ? "flex" : "hidden"
          )}
        >
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-5 py-3 text-[15px] font-medium text-white transition-colors hover:bg-white/10 md:rounded-md md:px-3.5 md:py-2",
                  active && "bg-white/10 md:border-b-2 md:border-gold-500"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/donate"
            onClick={() => setOpen(false)}
            className="mx-5 mt-2 block rounded-full bg-gold-500 px-4 py-2.5 text-center font-semibold text-navy-950 transition-colors hover:bg-gold-400 md:mx-0 md:ml-2 md:mt-0"
          >
            Donate
          </Link>
        </nav>
      </div>
    </header>
  );
}
