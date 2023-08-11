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
