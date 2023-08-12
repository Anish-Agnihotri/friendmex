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

/**
 * getPrice function transcribed from solidity
 * @dev https://basescan.org/address/0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4#code
 * @param {number} supply of user token
 * @param {number} amount of user token to buy or sell
 * @returns {number} price of action (received or given)
 */
export function getPrice(supply: number, amount: number): number {
  const sum1 =
    supply === 0 ? 0 : ((supply - 1) * supply * (2 * (supply - 1) + 1)) / 6;
  const sum2 =
    supply === 0 && amount === 1
      ? 0
      : ((supply - 1 + amount) *
          (supply + amount) *
          (2 * (supply - 1 + amount) + 1)) /
        6;
  const summation = sum2 - sum1;
  return summation / 16000;
}
