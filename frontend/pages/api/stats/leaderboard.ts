import Redis from "ioredis";
import type { User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const redis = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");

/**
 * Collect leaderboard users (limit: 50) from 15s Redis cache
 * @returns {Promise<(User & { cost: number })[]>} leaderboard users
 */
export async function getLeaderboardUsers(): Promise<
  (User & { cost: number })[]
> {
  const res: string | null = await redis.get("leaderboard");
  if (!res) return [];

  // Parse as leaderboard users
  return JSON.parse(res) as (User & { cost: number })[];
}

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    // Get leaderboard users
    const users = await getLeaderboardUsers();
    return res.status(200).json({ users });
  } catch (e: unknown) {
    // Catch errors
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }

    // Return default error
    return res.status(500).json({ message: "Internal server error" });
  }
}
