import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * `cn` merges Tailwind class names intelligently: clsx handles conditional
 * classes, twMerge resolves conflicts (e.g. "p-2 p-4" -> "p-4").
 * This is the same helper shadcn/ui uses.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an integer price (the backend stores prices as whole numbers). */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
