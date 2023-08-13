import cache from "utils/cache";
import type { UserInfo } from "components/User";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Collect leaderboard users (limit: 50) from 15s Redis cache
 * @returns {Promise<UserInfo[]>} leaderboard users
 */
export async function getLeaderboardUsers(): Promise<UserInfo[]> {
  const res: string | null = await cache.get("leaderboard");
  if (!res) return [];

  // Parse as leaderboard users
  return JSON.parse(res) as UserInfo[];
}

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    // Get leaderboard users
    const users = await getLeaderboardUsers();
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
