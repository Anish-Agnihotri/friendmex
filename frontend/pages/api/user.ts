import db from "prisma/index";
import cache from "utils/cache";
import { getPrice } from "utils";
import type { StateUser } from "state/global";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Collects StateUser object for address or throws
 * @param {string} address to collect
 * @returns {Promise<StateUser>}
 */
export async function getStateUser(address: string): Promise<StateUser> {
  // Force lowercase
  const lowerAddress: string = address.toLowerCase();

  // Check for cache
  const cached = await cache.get(`state_user_${lowerAddress}`);
  // If cached, return
  if (cached) return JSON.parse(cached) as StateUser;

  // Collect from db
  const { twitterPfpUrl: image, twitterUsername: username } =
    await db.user.findUniqueOrThrow({
      where: {
        address: lowerAddress,
      },
      select: {
        twitterPfpUrl: true,
        twitterUsername: true,
      },
    });

  // Setup user
  const user: StateUser = {
    address: lowerAddress,
    image,
    username,
  };

  // Store in cache
  const ok = await cache.set(
    `state_user_${lowerAddress}`,
    JSON.stringify(user)
  );
  if (ok !== "OK") throw new Error("Error updating cache");

  // Return data
  return user;
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  // Collect address from body
  let { address } = req.query;
  // Throw if missing parameter
  if (!address) return res.status(400).json({ error: "Missing address" });
  if (!Array.isArray(address)) address = [address];

  try {
    // Check for users
    const users = await db.user.findMany({
      where: {
        address: {
          in: address,
        },
      },
    });

    // Augment w/ cost
    const augmented = users.map((user) => ({
      ...user,
      cost: getPrice(user.supply, 1),
    }));

    return res.status(200).json(augmented);
  } catch (e: unknown) {
    // Catch errors
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }

    // Return default error
    return res.status(500).json({ message: "Internal server error" });
  }
}
