import cache from "utils/cache";
import type { UserInfo } from "components/User";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Collect newest users (limit: 50) from 15s Redis cache
 * @returns {Promise<UserInfo[]>} newest users
 */
export async function getNewestUsers(): Promise<UserInfo[]> {
  const res: string | null = await cache.get("latest_users");
  if (!res) return [];
  return JSON.parse(res) as UserInfo[];
}

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    // Get newest users
    const users = await getNewestUsers();
    return res.status(200).json(users);
  } catch (e: unknown) {
    // Catch errors
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }

    // Return default error
    return res.status(500).json({ message: "Internal server error" });
  }
}
