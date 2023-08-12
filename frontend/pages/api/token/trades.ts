import db from "prisma/index";
import type { Trade } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Collect token address
  const { address }: { address: string } = req.body;
  if (address) return res.status(400).json({ error: "Missing token address" });

  try {
    // Get trades by token address
    const trades: Trade[] = await db.trade.findMany({
      where: {
        subjectAddress: address,
      },
    });

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
