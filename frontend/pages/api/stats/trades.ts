import Redis from "ioredis";
import type { Trade } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const redis = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");

/**
 * Collect newest trades (limit: 100)
 * @returns {Promise<Trade[]>} newest trades
 */
export async function getLatestTrades(): Promise<Trade[]> {
  const res: string | null = await redis.get("latest_trades");
  if (!res) return [];

  // Parse as Trades
  return JSON.parse(res) as Trade[];
}

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    // Get latest trades
    const trades = await getLatestTrades();
    return res.status(200).json({ trades });
  } catch (e: unknown) {
    // Catch errors
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }

    // Return default error
    return res.status(500).json({ message: "Internal server error" });
  }
}
