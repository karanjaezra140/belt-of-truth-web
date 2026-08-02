import { defineField, defineType } from "sanity";

export const freeResource = defineType({
  name: "freeResource",
  title: "Free Resource",
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Photo",
      description: "Shown as the tile's background photo, with the title and description revealed on hover — falls back to a placeholder until added.",
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
    select: { title: "title", subtitle: "description", media: "image" },
  },
});
