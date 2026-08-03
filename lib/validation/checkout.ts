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

// Accepts 07XX/01XX, 7XX/1XX, or 2547XX/2541XX — normalizeKenyanPhone()
// (lib/mpesa.ts) does the actual normalization before this ever reaches Daraja.
const kenyanPhoneSchema = z
  .string()
  .trim()
  .regex(/^(?:254|0)?(7|1)\d{8}$/, "Please enter a valid Safaricom number, e.g. 07XXXXXXXX");

export const mpesaDonationSchema = donationSchema.extend({ phone: kenyanPhoneSchema });
export const mpesaBookPurchaseSchema = bookPurchaseSchema.extend({ phone: kenyanPhoneSchema });
