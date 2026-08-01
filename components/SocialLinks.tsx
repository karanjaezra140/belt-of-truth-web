import { SOCIAL_LINKS } from "@/lib/site-config";
import { SOCIAL_ICONS } from "@/lib/social-icons";
import { cn } from "@/lib/utils";

export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap justify-center gap-3", className)}>
      {SOCIAL_LINKS.map((social) => {
        const Icon = SOCIAL_ICONS[social.icon];
        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:-translate-y-0.5 hover:border-navy-800 hover:shadow-md"
          >
            <Icon className="text-lg text-navy-800" />
            {social.label}
          </a>
        );
      })}
    </div>
  );
}
