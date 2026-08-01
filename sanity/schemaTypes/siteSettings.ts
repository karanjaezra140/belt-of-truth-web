import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
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
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
