import { defineField, defineType } from "sanity";

// Created when an STK push is initiated (app/api/mpesa/stkpush/route.ts) and
// updated by Safaricom's callback (app/api/mpesa/callback/route.ts). Unlike
// Paystack's webhook, Daraja callbacks aren't signed, so the callback trusts
// only the amount/purpose recorded here — keyed by checkoutRequestId — over
// whatever the callback body itself claims.
export const mpesaTransaction = defineType({
  name: "mpesaTransaction",
  title: "M-Pesa Transaction (internal)",
  type: "document",
  fields: [
    defineField({ name: "checkoutRequestId", title: "Checkout Request ID", type: "string" }),
    defineField({ name: "merchantRequestId", title: "Merchant Request ID", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "amountKes", title: "Amount (KES)", type: "number" }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: { list: ["donation", "book_purchase"] },
    }),
    defineField({ name: "donorName", title: "Name", type: "string" }),
    defineField({ name: "donorEmail", title: "Email", type: "string" }),
    defineField({ name: "bookSlug", title: "Book slug", type: "string" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["pending", "success", "failed"] },
      initialValue: "pending",
    }),
    defineField({ name: "resultDescription", title: "Result description", type: "string" }),
    defineField({ name: "mpesaReceiptNumber", title: "M-Pesa receipt number", type: "string" }),
    defineField({ name: "createdAt", title: "Created at", type: "datetime" }),
  ],
  preview: {
    select: { title: "donorName", subtitle: "status" },
  },
});
