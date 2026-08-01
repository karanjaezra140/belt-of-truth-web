import { z } from "zod";

export const donationSchema = z.object({
  amountKes: z.number().int().min(50, "Minimum donation is KSh 50"),
  donorName: z.string().trim().min(2, "Please enter your name").max(120),
  donorEmail: z.email("Please enter a valid email address"),
});

export type DonationValues = z.infer<typeof donationSchema>;

export const bookPurchaseSchema = z.object({
  bookSlug: z.string().min(1),
  buyerName: z.string().trim().min(2, "Please enter your name").max(120),
  buyerEmail: z.email("Please enter a valid email address"),
});

export type BookPurchaseValues = z.infer<typeof bookPurchaseSchema>;
