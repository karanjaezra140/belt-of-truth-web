import { defineField, defineType } from "sanity";

// Written by app/api/contact/route.ts whenever the contact form is
// submitted — a record for the admin dashboard, in addition to the email
// notification. Not intended to be created manually.
export const contactSubmission = defineType({
  name: "contactSubmission",
  title: "Contact Submission",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "interest", title: "Interested in", type: "string" }),
    defineField({ name: "message", title: "Message", type: "text", rows: 4 }),
    defineField({ name: "submittedAt", title: "Submitted at", type: "datetime" }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "interest" },
  },
});
