import Redis from "ioredis";
import { NextApiRequest, NextApiResponse } from "next";

const redis = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");

export type RealizedProfitUser = {
  address: string;
  twitterPfpUrl?: string | null;
  twitterUsername?: string | null;
  profit: number;
};

/**
 * Collect realized profits (limit: 100) from 15s Redis cache
 * @returns {RealizedProfitUser[]} address to realized profit
 */
export async function getRealizedProfits(): Promise<RealizedProfitUser[]> {
  const res: string | null = await redis.get("realized_profit");
  if (!res) return [];
  return JSON.parse(res);
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
