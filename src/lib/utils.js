import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names safely with Tailwind CSS conflict resolution.
 * Standard helper used across all shadcn/ui components.
 *
 * @param {...any} inputs - Class values to combine
 * @returns {string} - Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
