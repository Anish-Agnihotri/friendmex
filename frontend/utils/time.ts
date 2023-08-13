/**
 * Given some time in seconds, returns formatted string in format "{value}{unit}"
 * @dev Assumes that things will fail much before a transition beyond 59m 59s
 * @param {number} s seconds value
 * @returns {string} formatted string
 */
export function renderTimeSince(s: number): string {
  // If minutes not relevant, return seconds
  if (s < 60) return `${s}s`;
  // Else, get number of minutes
  const seconds: number = s % 60;
  const minutes: number = (s - seconds) / 60;
  return `${minutes}m ${seconds}s`;
}
