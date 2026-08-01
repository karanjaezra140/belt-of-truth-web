import { defineField, defineType } from "sanity";

// Written by the Paystack webhook (app/api/paystack/webhook/route.ts) after a
// verified successful payment — not intended to be created manually.
export const donation = defineType({
  name: "donation",
  title: "Donation",
  type: "document",
  fields: [
    defineField({ name: "reference", title: "Paystack reference", type: "string" }),
    defineField({ name: "donorName", title: "Donor name", type: "string" }),
    defineField({ name: "donorEmail", title: "Donor email", type: "string" }),
    defineField({ name: "amountKes", title: "Amount (KES)", type: "number" }),
    defineField({ name: "kind", title: "Kind", type: "string", options: { list: ["donation", "book_purchase"] } }),
    defineField({ name: "bookTitle", title: "Book title (if a purchase)", type: "string" }),
    defineField({
      name: "book",
      title: "Book",
      type: "reference",
      to: [{ type: "book" }],
    }),
    defineField({ name: "paidAt", title: "Paid at", type: "datetime" }),
  ],
  preview: {
    select: { title: "donorName", subtitle: "amountKes" },
    prepare({ title, subtitle }) {
      return { title: title || "Anonymous", subtitle: subtitle ? `KSh ${subtitle}` : undefined };
    },
  },
});
