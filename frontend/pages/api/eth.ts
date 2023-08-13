import axios from "axios";
import cache from "utils/cache";
import type { NextApiRequest, NextApiResponse } from "next";

// CoinGecko endpoint
const CG_ETHUSD: string =
  "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check cache
    const price: string | null = await cache.get("eth_price");
    if (price) return res.status(200).json(Number(price));

    // Collect data
    const {
      data: {
        ethereum: { usd },
      },
    }: { data: { ethereum: { usd: number } } } = await axios.get(CG_ETHUSD);

    // Update cache with 1m TTL
    const ok = await cache.set("eth_usd", usd, "EX", 60);
    if (ok !== "OK") throw new Error("Error updating cache");

    // Return price
    return res.status(200).json(usd);
  } catch (e: unknown) {
    // Catch errors
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }

    // Return default error
    return res.status(500).json({ message: "Internal server error" });
  }
}
