/**
 * Generic generator to chunk array
 * @param {T[]} arr to chunk
 * @param {number} n max size per chunk
 */
export function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}
