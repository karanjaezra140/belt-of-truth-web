import { defineField, defineType } from "sanity";

// Written by the Paystack webhook (app/api/paystack/webhook/route.ts) after a
// verified book purchase — grants the buyer access to the protected ebook
// reader at /read/[slug]. Not intended to be created manually; set `revoked`
// to true here to immediately cut off a buyer's access.
export const ebookAccess = defineType({
  name: "ebookAccess",
  title: "Ebook Access",
  type: "document",
  fields: [
    defineField({
      name: "book",
      title: "Book",
      type: "reference",
      to: [{ type: "book" }],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "buyerEmail", title: "Buyer email", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "tokenHash",
      title: "Token hash",
      description: "SHA-256 hash of the access token emailed to the buyer. The raw token is never stored.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "reference", title: "Paystack reference", type: "string" }),
    defineField({ name: "expiresAt", title: "Expires at", type: "datetime", validation: (rule) => rule.required() }),
    defineField({ name: "revoked", title: "Revoked", type: "boolean", initialValue: false }),
    defineField({ name: "createdAt", title: "Created at", type: "datetime" }),
  ],
  preview: {
    select: { title: "buyerEmail", subtitle: "book.title", revoked: "revoked" },
    prepare({ title, subtitle, revoked }) {
      return {
        title,
        subtitle: [subtitle, revoked ? "(revoked)" : null].filter(Boolean).join(" "),
      };
    },
  },
});
