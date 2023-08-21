import Redis from "ioredis";
import logger from "./utils/logger";
import { getPrice } from "./utils/math";
import constants from "./utils/constants";
import { PrismaClient, type User } from "@prisma/client";

export default class Stats {
  // Database
  private db: PrismaClient;
  // Redis cache
  private redis: Redis;

  /**
   * Create new Stats
   * @param {string} redis_url Cache URL
   */
  constructor(redis_url: string) {
    // Setup db
    this.db = new PrismaClient();
    // Setup redis
    this.redis = new Redis(redis_url);
  }

  /**
   * Tracks newest 50 users
   */
  async updateNewestUsers(): Promise<void> {
    const users: User[] = await this.db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Augment data with cost
    const augmented = users.map((user) => ({
      ...user,
      cost: getPrice(user.supply, 1),
    }));

    await this.redis.set("latest_users", JSON.stringify(augmented));
  }

  /**
   * Tracks latest 100 trades
   */
  async udpateRecentTrades(): Promise<void> {
    const txs = await this.db.trade.findMany({
      orderBy: {
        timestamp: "desc",
      },
      include: {
        fromUser: {
          select: {
            twitterUsername: true,
            twitterPfpUrl: true,
          },
        },
        subjectUser: {
          select: {
            twitterUsername: true,
            twitterPfpUrl: true,
          },
        },
      },
      take: 100,
    });

    await this.redis.set("latest_trades", JSON.stringify(txs));
  }

  async tokenLeaderboard(): Promise<void> {
    const users: User[] = await this.db.user.findMany({
      orderBy: {
        supply: "desc",
      },
      take: 50,
    });

    let extended: (User & { cost: number })[] = [];
    // Calculate cost per user
    for (const user of users) {
      // Calculate price to buy tokens
      const cost = getPrice(user.supply, 1);
      const fees = cost * constants.FEE * 2;

      extended.push({
        ...user,
        cost: cost + fees,
      });

      await this.redis.set("leaderboard", JSON.stringify(extended));
    }
  }

  async mostProfitableUsers() {
    const users = await this.db.user.findMany({
      select: {
        address: true,
        twitterPfpUrl: true,
        twitterUsername: true,
        createdTrades: true,
      },
    });

    let userToProfit: Record<string, number> = {};
    for (const user of users) {
      userToProfit[user.address] = 0;

      for (const trade of user.createdTrades) {
        if (trade.isBuy) {
          userToProfit[user.address] -= trade.cost.toNumber();
        } else {
          userToProfit[user.address] += trade.cost.toNumber();
        }
      }
    }

    // Generate subset users
    let subsetUsers: {
      address: string;
      twitterPfpUrl?: string | null;
      twitterUsername?: string | null;
      profit: number;
    }[] = [];
    for (const user of users) {
      subsetUsers.push({
        address: user.address,
        twitterPfpUrl: user.twitterPfpUrl,
        twitterUsername: user.twitterUsername,
        profit: userToProfit[user.address],
      });
    }

    // Sort users by profit
    subsetUsers.sort((a, b) => b.profit - a.profit);
    subsetUsers = subsetUsers.slice(0, 100); // Take top 100
    subsetUsers = subsetUsers.map((u) => ({ ...u, profit: u.profit / 1e18 })); // Parse profit to ETH

    await this.redis.set("realized_profit", JSON.stringify(subsetUsers));
  }

  /**
   * Stats synced at a 15s frequency
   */
  async sync15s(): Promise<void> {
    await Promise.all([
      this.updateNewestUsers(),
      this.udpateRecentTrades(),
      this.tokenLeaderboard(),
    ]);

    // Recollect in 15s
    logger.info("Stats: Collected quarter-minute stats");
    setTimeout(() => this.sync15s(), 1000 * 15);
  }

  async sync30m(): Promise<void> {
    await this.mostProfitableUsers();

    // Recollect in 1h
    logger.info("Stats: Collected half-hourly stats");
    setTimeout(() => this.sync30m, 1000 * 60 * 60);
  }
}
