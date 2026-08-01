import { z } from "zod";
import { CONTACT_INTERESTS } from "@/lib/site-config";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.email("Please enter a valid email address"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  interest: z.enum(CONTACT_INTERESTS).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please tell us a bit more (10+ characters)").max(4000),
  // Honeypot: real users never see or fill this field.
  company: z.string().max(0, "").optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
