import Redis from "ioredis";
import type { User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const redis = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");

/**
 * Collect newest users (limit: 50) from 15s Redis cache
 * @returns {Promise<User[]>} newest users
 */
export async function getNewestUsers(): Promise<User[]> {
  const res: string | null = await redis.get("latest_users");
  if (!res) return [];

  // Parse as Users
  return JSON.parse(res) as User[];
}

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    // Get newest users
    const users = await getNewestUsers();
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
