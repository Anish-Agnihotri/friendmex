import db from "prisma/index";
import cache from "utils/cache";
import { getPrice } from "utils";
import type { Trade } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

// Types
type ChartData = { timestamp: Date; "Price (ETH)": number }[];
type CachedData = { count: number; chart: ChartData };

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
    // Check cache
    const cacheData = await cache.get(`user_chart_${address}`);
    if (cacheData) {
      // Parse cache data
      const parsedCacheData = JSON.parse(cacheData) as CachedData;
      return res.status(200).send(parsedCacheData.chart);
    }

    // Get all trades by token address
    const trades: Trade[] = await db.trade.findMany({
      orderBy: {
        timestamp: "asc",
      },
      where: {
        subjectAddress: address.toLowerCase(),
      },
    });

    // Generate cumulative data
    let supply = 0;
    let data: ChartData = [];
    for (const trade of trades) {
      // Modify amounts
      if (trade.isBuy) supply += trade.amount;
      else supply -= trade.amount;

      // Calculate new price for 1 token given supply change
      const price = getPrice(supply, 1);
      const fees = price * 0.1;

      // Add new plot data
      data.push({
        timestamp: new Date(trade.timestamp * 1000),
        "Price (ETH)": price - fees,
      });
    }

    // Store in redis cache
    const ok = await cache.set(
      `chart_${address}`,
      JSON.stringify({
        chart: data,
      } as CachedData),
      "EX",
      60 * 10 // 10 minute cache
    );
    if (ok != "OK") throw new Error("Errored storing in cache");

    // Return data
    return res.status(200).json(data);
  } catch (e: unknown) {
    // Catch errors
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }

    // Return default error
    return res.status(500).json({ message: "Internal server error" });
  }
}
