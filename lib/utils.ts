import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Signature asymmetric "notch" corner used across photos, cards, and panels
// to match the brand's reference visual language (one squared corner, three rounded).
export const NOTCH =
  "rounded-tl-none rounded-tr-[40px] rounded-br-[40px] rounded-bl-[40px]";
export const NOTCH_ALT =
  "rounded-tl-none rounded-tr-[40px] rounded-br-none rounded-bl-[40px]";
