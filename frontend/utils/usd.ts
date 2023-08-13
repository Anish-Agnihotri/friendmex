/**
 * Parse USD numeric in appropriate dollar format
 * @param {number} value to parse
 * @returns {string} parsed
 */
export function parseUSD(value: number): string {
  return value.toLocaleString("us-en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
