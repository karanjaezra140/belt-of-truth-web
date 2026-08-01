import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS, SOCIAL_LINKS, SITE_NAME } from "@/lib/site-config";
import { SOCIAL_ICONS } from "@/lib/social-icons";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-navy-950 px-5 pb-6 pt-14 text-gray-300 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:justify-between">
        <div className="flex flex-col items-start gap-1.5 md:flex-[2]">
          <Image
            src="/images/logo.png"
            alt={`${SITE_NAME} logo`}
            width={48}
            height={48}
            className="mb-1 h-12 w-auto object-contain"
          />
          <p className="font-display text-base text-white">{SITE_NAME}</p>
          <p className="text-[13px] italic text-gray-400">
            Empowering lives through truth and purpose
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gold-500">
            Quick Links
          </h4>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 transition-colors hover:text-gold-500"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gold-500">
            Connect With Us
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {SOCIAL_LINKS.map((social) => {
              const Icon = SOCIAL_ICONS[social.icon];
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-gray-300 transition-all duration-200 hover:scale-125 hover:border-gold-500 hover:text-gold-500"
                >
                  <Icon className="text-sm" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-4 text-center text-[13px] text-gray-500">
        © {year} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
