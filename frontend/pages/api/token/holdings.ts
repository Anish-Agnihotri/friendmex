import db from "prisma/index";
import type { User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

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
    // Get all trades by token address
    const trades = await db.trade.findMany({
      where: {
        fromAddress: address,
      },
      orderBy: {
        timestamp: "asc",
      },
      include: {
        subjectUser: true,
      },
    });

    // Recompute holdings manually
    let subjectToBalance: Record<string, number> = {};
    let subjectToUser: Record<string, User> = {};
    for (const trade of trades) {
      if (!subjectToBalance[trade.subjectAddress]) {
        // Initialize balance
        subjectToBalance[trade.subjectAddress] = 0;
        // Initialize data
        subjectToUser[trade.subjectAddress] = trade.subjectUser;
      }

      // Process trade
      if (trade.isBuy) {
        subjectToBalance[trade.subjectAddress] += trade.amount;
      } else {
        subjectToBalance[trade.subjectAddress] -= trade.amount;
      }
    }

    // Recompile to return format
    let holdings: (User & { balance: number })[] = [];
    for (const address of Object.keys(subjectToBalance)) {
      if (subjectToBalance[address] > 0) {
        holdings.push({
          ...subjectToUser[address],
          balance: subjectToBalance[address],
        });
      }
    }

    // Sort by most owned first
    holdings = holdings.sort((a, b) => b.balance - a.balance);

    return res.status(200).json(holdings);
  } catch (e: unknown) {
    // Catch errors
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }

    // Return default error
    return res.status(500).json({ message: "Internal server error" });
  }
}
