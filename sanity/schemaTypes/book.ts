import { defineField, defineType } from "sanity";

export const book = defineType({
  name: "book",
  title: "Book",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cover",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "priceKes",
      title: "Price (KES)",
      type: "number",
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "ebookFile",
      title: "Ebook file (PDF)",
      description:
        "Upload the PDF here to unlock the protected on-site reader. Buyers get an emailed access link after purchase — the file itself is never made downloadable.",
      type: "file",
      options: { accept: "application/pdf" },
    }),
    defineField({
      name: "ebookPageCount",
      title: "Ebook page count",
      description: "Total pages in the PDF above — required for the reader's page navigation.",
      type: "number",
      hidden: ({ document }) => !document?.ebookFile,
      validation: (rule) => rule.positive().integer(),
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "priceKes", media: "cover" },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? `KSh ${subtitle}` : undefined,
        media,
      };
    },
  },
});
