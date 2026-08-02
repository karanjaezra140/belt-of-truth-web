import { defineField, defineType } from "sanity";

export const focusArea = defineType({
  name: "focusArea",
  title: "Focus Area",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "emoji",
      title: "Emoji icon",
      description: "Used only as a fallback until a photo is uploaded below.",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Photo",
      description: "Shown as the tile's background photo with the title overlaid — falls back to the emoji until this is added.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 0,
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
    select: { title: "title", media: "image" },
  },
});
