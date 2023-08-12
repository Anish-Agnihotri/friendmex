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

/**
 * Contract address
 */
export const CONTRACT_ADDRESS = "0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4";

/**
 * Contract ABI
 */
export const ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "trader",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "subject",
        type: "address",
      },
      { indexed: false, internalType: "bool", name: "isBuy", type: "bool" },
      {
        indexed: false,
        internalType: "uint256",
        name: "shareAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "protocolEthAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "subjectEthAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "supply",
        type: "uint256",
      },
    ],
    name: "Trade",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "sharesSubject", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "buyShares",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sharesSubject", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "getBuyPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sharesSubject", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "getBuyPriceAfterFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "supply", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "getPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sharesSubject", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "getSellPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sharesSubject", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "getSellPriceAfterFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "protocolFeeDestination",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "protocolFeePercent",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sharesSubject", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "sellShares",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_feeDestination", type: "address" },
    ],
    name: "setFeeDestination",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_feePercent", type: "uint256" }],
    name: "setProtocolFeePercent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_feePercent", type: "uint256" }],
    name: "setSubjectFeePercent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "sharesBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "sharesSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "subjectFeePercent",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
