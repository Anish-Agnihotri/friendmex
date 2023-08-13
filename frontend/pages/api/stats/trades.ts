import cache from "utils/cache";
import type { Trade } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export type TradeWithTwitterUser = Trade & {
  fromUser: {
    twitterUsername?: string | null;
    twitterPfpUrl?: string | null;
  };
  subjectUser: {
    twitterUsername?: string | null;
    twitterPfpUrl?: string | null;
  };
};

/**
 * Collect newest trades (limit: 100)
 * @returns {Promise<TradeWithTwitterUser[]>} newest trades
 */
export async function getLatestTrades(): Promise<TradeWithTwitterUser[]> {
  const res: string | null = await cache.get("latest_trades");
  if (!res) return [];

  // Parse as Trades
  return JSON.parse(res) as TradeWithTwitterUser[];
}

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    // Get latest trades
    const trades = await getLatestTrades();
    return res.status(200).json(trades);
  } catch (e: unknown) {
    // Catch errors
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }

    // Return default error
    return res.status(500).json({ message: "Internal server error" });
  }
}
