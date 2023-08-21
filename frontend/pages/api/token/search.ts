import db from "prisma/index";
import { getPrice } from "utils";
import type { User } from "@prisma/client";
import type { UserInfo } from "components/User";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  // Collect search query
  const { search }: { search: string } = req.body;
  if (!search) return res.status(400).json({ error: "Missing search query" });

  try {
    // Search prisma (faking fuzzy search, Prisma limitation)
    let users: User[] = await db.user.findMany({
      where: {
        OR: [
          {
            address: {
              search: search.toLowerCase(),
            },
          },
          {
            twitterUsername: {
              search,
            },
          },
        ],
      },
      take: 10,
    });

    // Augment users with cost
    const augmented: UserInfo[] = users.map((user) => ({
      ...user,
      cost: getPrice(user.supply, 1),
    }));

    return res.status(200).send(augmented);
  } catch (e: unknown) {
    // Catch errors
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }

    // Return default error
    return res.status(500).json({ message: "Internal server error" });
  }
}
