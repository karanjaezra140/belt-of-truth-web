import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "heroImages",
      title: "Homepage — rotating hero photos",
      description: "Upload as many as you like — they'll auto-rotate behind the homepage headline. Leave empty to keep the single default photo.",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (rule) => rule.max(8),
    }),
    defineField({
      name: "heroStats",
      title: "Homepage impact stats",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "number", type: "string", title: "Number (e.g. 2,000+)" },
            { name: "label", type: "string", title: "Label" },
          ],
        },
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "founderName",
      title: "Founder name",
      type: "string",
    }),
    defineField({
      name: "founderPhoto",
      title: "Founder photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "founderBio",
      title: "Founder bio",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
    }),
    defineField({
      name: "whatsappNumber",
      title: "WhatsApp number",
      type: "string",
      description: "International format, e.g. 254712345678",
    }),
    defineField({
      name: "missionVisionPhoto",
      title: "Homepage — Mission & Vision photo",
      description: "Shown on the homepage's Mission & Vision section. Ignored if a video is set below.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "missionVisionVideo",
      title: "Homepage — Mission & Vision video (optional)",
      description: "Takes priority over the photo above if set. Keep the file small — large videos slow the page down.",
      type: "file",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "contactHeroPhoto",
      title: "Contact page — hero photo",
      description: "Shown at the top of the Contact page. Ignored if a video is set below.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "contactHeroVideo",
      title: "Contact page — hero video (optional)",
      description: "Takes priority over the photo above if set. Keep the file small — large videos slow the page down.",
      type: "file",
      options: { accept: "video/*" },
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
