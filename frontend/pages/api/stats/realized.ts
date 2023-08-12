import Redis from "ioredis";
import { NextApiRequest, NextApiResponse } from "next";

const redis = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");

/**
 * Collect realized profits (limit: 100) from 15s Redis cache
 * @returns {{ address: string; profit: number }[]} address to realized profit
 */
export async function getRealizedProfits(): Promise<
  { address: string; profit: number }[]
> {
  const res: string | null = await redis.get("realized_profit");
  if (!res) return [];

  // Take top 100
  let values: { address: string; profit: number }[] = Object.entries(
    JSON.parse(res)
  ).map(([address, profit]) => ({
    address,
    profit: Number(profit) / 1e18,
  }));

  // Sort values
  values = values.sort((a, b) => b.profit - a.profit);

  // Return top 100
  return values.slice(0, 100);
}

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    // Get realized profits
    const profits = await getRealizedProfits();
    return res.status(200).json({ profits });
  } catch (e: unknown) {
    // Catch errors
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }

    // Return default error
    return res.status(500).json({ message: "Internal server error" });
  }
}
