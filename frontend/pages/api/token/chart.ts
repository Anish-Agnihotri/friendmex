import db from "prisma/index";
import cache from "utils/cache";
import { getPrice } from "utils";
import type { Trade } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

// Types
type ChartData = { timestamp: Date; "Price (ETH)": number }[];
type CachedData = { lastChecked: Date; chart: ChartData; supply: number };

function processTrades(trades: Trade[], existing?: CachedData): CachedData {
  let supply: number = 0,
    data: ChartData = [];

  // If existing chart data
  if (existing) {
    // Track trades
    data.push(...existing.chart);
    // Append supply
    supply += existing.supply;
  }

  // Take remaining, new trades
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

  return {
    lastChecked: new Date(),
    chart: data,
    supply,
  };
}

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
    // Check cache to see if chart exists
    const cacheData = await cache.get(`fmex_chart_${address}`);

    let processed: CachedData;
    if (cacheData) {
      // If cache exists, check cache last update time
      let parsedData: Omit<CachedData, "lastChecked"> & {
        lastChecked: string;
      } = JSON.parse(cacheData);
      const parsedToType: CachedData = {
        ...parsedData,
        lastChecked: new Date(parsedData.lastChecked),
      };

      // Time since last update > 5m
      const timeDiffInMS =
        new Date().getTime() - parsedToType.lastChecked.getTime();
      if (timeDiffInMS > 5 * 60 * 1000) {
        // Collect new trades to occur since lastChecked time
        const trades: Trade[] = await db.trade.findMany({
          orderBy: {
            timestamp: "asc",
          },
          where: {
            subjectAddress: address.toLowerCase(),
            createdAt: {
              gte: parsedToType.lastChecked,
            },
          },
        });

        // If no new updates in last 5m
        if (trades.length === 0) {
          // Update cache and return latest
          const ok = await cache.set(
            `fmex_chart_${address}`,
            JSON.stringify({
              ...parsedToType,
              lastChecked: new Date(),
            })
          );
          if (ok != "OK") throw new Error("Errored storing in cache");
          return res.status(200).json(parsedToType.chart);
        }

        // Augment existing trades
        processed = processTrades(trades, parsedToType);
      } else {
        // Simply return cached data
        return res.status(200).json(parsedData.chart);
      }
    } else {
      // If cache does not exist, retrieve all trades
      const trades: Trade[] = await db.trade.findMany({
        orderBy: {
          timestamp: "asc",
        },
        where: {
          subjectAddress: address.toLowerCase(),
        },
      });

      // Process trades
      processed = processTrades(trades);
    }

    // Store in Redis
    const ok = await cache.set(
      `fmex_chart_${address}`,
      JSON.stringify(processed)
    );
    if (ok != "OK") throw new Error("Errored storing in cache");

    // Return new data
    return res.status(200).json(processed.chart);
  } catch (e: unknown) {
    // Catch errors
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }

    // Return default error
    return res.status(500).json({ message: "Internal server error" });
  }
}
