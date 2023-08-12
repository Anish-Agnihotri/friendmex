import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncates address to format 0xAAAA...AAAA
 * @param {string} address to truncate
 * @param {number} numTruncated numbers to truncate
 * @returns {string} truncated
 */
export function truncateAddress(address: string, numTruncated: number): string {
  return (
    address.slice(0, numTruncated + 2) +
    "..." +
    address.substring(address.length - numTruncated)
  );
}
