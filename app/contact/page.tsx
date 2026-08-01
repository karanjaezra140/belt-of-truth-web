import type { Metadata } from "next";
import { HiOutlineLocationMarker, HiOutlineMail, HiOutlineChat } from "react-icons/hi";
import { ContactForm } from "@/components/ContactForm";
import { SocialLinks } from "@/components/SocialLinks";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { PhotoCTA } from "@/components/ui/PhotoCTA";
import { SOCIAL_LINKS } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach out to Belt of Truth Mentorship to join our mentorship programs, volunteer, or partner with us.",
};

export default async function ContactPage() {
  const { contactEmail, contactHeroPhoto, contactHeroVideo } = await getSiteSettings();
  const contactHeroPhotoUrl = contactHeroPhoto
    ? urlFor(contactHeroPhoto)?.width(1000).height(500).fit("crop").url()
    : undefined;
  const whatsapp = SOCIAL_LINKS.find((s) => s.icon === "whatsapp");

  const infoItems = [
    { icon: HiOutlineLocationMarker, title: "Visit Us", detail: "Kenya" },
    whatsapp && { icon: HiOutlineChat, title: "Message Us", detail: whatsapp.href.replace("https://wa.me/", "+") },
    contactEmail && { icon: HiOutlineMail, title: "Email Us", detail: contactEmail },
  ].filter((item): item is { icon: typeof HiOutlineMail; title: string; detail: string } => Boolean(item));

  return (
    <>
      <PhotoCTA
        eyebrow="get in touch."
        title="We'd Love to Hear From You"
        buttonLabel="Send a Message"
        buttonHref="#message"
        mediaAlt="Someone reaching out to Belt of Truth Mentorship"
        mediaLabel="contact hero photo"
        mediaSrc={contactHeroPhotoUrl}
        mediaVideoSrc={contactHeroVideo?.asset?.url}
      />

      <AnimatedSection className="mx-auto max-w-5xl px-5 pb-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {infoItems.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 text-center shadow-[0_3px_12px_rgba(0,0,0,0.07)]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold-500 bg-gold-500/10 text-2xl text-navy-800">
                <item.icon />
              </span>
              <h3 className="text-base font-semibold text-navy-800">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection id="message" className="scroll-mt-20 px-5 pb-16">
        <ContactForm />
      </AnimatedSection>

      <AnimatedSection className="px-5 pb-20">
        <h3 className="mb-4 text-center text-xl font-semibold text-navy-800">
          Connect With Us
        </h3>
        <SocialLinks />
      </AnimatedSection>
    </>
  );
}
