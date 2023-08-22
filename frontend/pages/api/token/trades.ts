import db from "prisma/index";
import cache from "utils/cache";
import type { NextApiRequest, NextApiResponse } from "next";
import type { TradeWithTwitterUser } from "../stats/trades";

type CachedData = { lastChecked: Date; trades: TradeWithTwitterUser[] };

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
    const cachedString = await cache.get(`cach_trades_${address}`);

    let data: CachedData;
    // If cached data exists
    if (cachedString) {
      // Parse cache
      const parseString: Omit<CachedData, "lastChecked"> & {
        lastChecked: string;
      } = JSON.parse(cachedString);
      const parsed: CachedData = {
        ...parseString,
        lastChecked: new Date(parseString.lastChecked),
      };

      // Time since last update > 5m
      const timeDiffInMS = new Date().getTime() - parsed.lastChecked.getTime();
      if (timeDiffInMS > 5 * 60 * 1000) {
        // Collect new data from lastChecked point
        const trades = await db.trade.findMany({
          orderBy: {
            timestamp: "desc",
          },
          where: {
            subjectAddress: address.toLowerCase(),
            createdAt: {
              gte: parsed.lastChecked,
            },
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

        // If no new trades, return cached
        if (trades.length === 0) {
          // Update last checked time
          const ok = await cache.set(
            `cach_trades_${address}`,
            JSON.stringify({
              lastChecked: new Date(),
              trades: parsed.trades,
            })
          );
          if (ok != "OK") throw new Error("Errored storing in cache");

          return res.status(200).json(parsed.trades);
        }

        // Else, augment new trades and store
        data = {
          lastChecked: new Date(),
          // Remove number of new trades from beginning
          trades: [...trades, ...parsed.trades].slice(0, -1 * trades.length),
        };
      } else {
        // Return cached data
        return res.status(200).json(parsed.trades);
      }
    } else {
      // If no cached data, collect trades from DB
      const trades = await db.trade.findMany({
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

      // Update local data
      data = {
        lastChecked: new Date(),
        trades,
      };
    }

    // Store in redis cache
    const ok = await cache.set(`cach_trades_${address}`, JSON.stringify(data));
    if (ok != "OK") throw new Error("Errored storing in cache");

    return res.status(200).json(data.trades);
  } catch (e: unknown) {
    // Catch errors
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }

    // Return default error
    return res.status(500).json({ message: "Internal server error" });
  }
}
