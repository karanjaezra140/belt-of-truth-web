import { defineField, defineType } from "sanity";

// Self-healing render cache written by app/api/ebooks/[slug]/page/[n]/route.ts
// the first time any buyer views a given page — the PDF is rasterized once
// per page (ever), then served from this cached image on every later request.
// Not intended to be created manually.
export const ebookPage = defineType({
  name: "ebookPage",
  title: "Ebook Page",
  type: "document",
  fields: [
    defineField({
      name: "book",
      title: "Book",
      type: "reference",
      to: [{ type: "book" }],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "pageNumber", title: "Page number", type: "number", validation: (rule) => rule.required().positive().integer() }),
    defineField({ name: "image", title: "Rendered page (plain, unwatermarked)", type: "image", validation: (rule) => rule.required() }),
  ],
  preview: {
    select: { title: "pageNumber", subtitle: "book.title" },
    prepare({ title, subtitle }) {
      return { title: `Page ${title}`, subtitle };
    },
  },
});
