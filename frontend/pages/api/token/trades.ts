import db from "prisma/index";
import cache from "utils/cache";
import type { NextApiRequest, NextApiResponse } from "next";
import type { TradeWithTwitterUser } from "../stats/trades";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Collect token address
  let { address } = req.query;
  if (!address) return res.status(400).json({ error: "Missing token address" });
  // Only accept first query parameter
  if (Array.isArray(address)) address = address[0];
  address = address.toLowerCase();

  try {
    const cachedTrades = await cache.get(`c_trades_${address}`);
    if (cachedTrades) return res.status(200).json(JSON.parse(cachedTrades));

    // Get trades by token address
    const trades: TradeWithTwitterUser[] = await db.trade.findMany({
      orderBy: {
        timestamp: "desc",
      },
      where: {
        subjectAddress: address.toLowerCase(),
      },
      include: {
        fromUser: {
          select: {
            twitterPfpUrl: true,
            twitterUsername: true,
          },
        },
        subjectUser: {
          select: {
            twitterPfpUrl: true,
            twitterUsername: true,
          },
        },
      },
      take: 100,
    });

    // Store in redis cache
    const ok = await cache.set(
      `c_trades_${address}`,
      JSON.stringify(trades),
      "EX",
      60 * 5 // 5 minute cache
    );
    if (ok != "OK") throw new Error("Errored storing in cache");

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
