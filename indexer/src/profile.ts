import logger from "./utils/logger";
import constants from "./utils/constants";
import { PrismaClient } from "@prisma/client";
import axios, { type AxiosInstance } from "axios";

/**
 * Sleep for period of time
 * @param {number} ms milliseconds to sleep
 * @returns {Promise} resolves when sleep period finished
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default class Profile {
  // Database
  db: PrismaClient;
  // Kosetto API client
  client: AxiosInstance;
  // Timeout duration
  timeout: number = 500;

  /**
   * Create profile manager
   */
  constructor() {
    // Setup db
    this.db = new PrismaClient();
    // Setup api client
    this.client = axios.create({
      baseURL: constants.API,
    });
  }

  /**
   * Syncs users metadata
   * @param address
   */
  async syncUser(address: string) {
    try {
      // Collect user details
      const {
        data,
      }: {
        data:
          | { message: string }
          | { twitterUsername: string; twitterPfpUrl: string };
      } = await this.client.get(`/users/${address}`);

      // Check for no message
      if ("message" in data) {
        // Update user to profile checked
        await this.db.user.update({
          where: {
            address,
          },
          data: {
            profileChecked: true,
          },
        });
        return;
      } else {
        // Update data
        await this.db.user.update({
          where: {
            address,
          },
          data: {
            twitterUsername: data.twitterUsername,
            twitterPfpUrl: data.twitterPfpUrl,
            profileChecked: true,
          },
        });
      }

      // If successful, reduce timeout back to 1/2s
      this.timeout = 500;

      // Log user
      logger.info(`Profile: collected @${data.twitterUsername}: ${address}`);
    } catch {
      // Timeout for a few seconds, exponential backoff
      this.timeout *= 2;
      await sleep(this.timeout);
      logger.error(
        `Error on profile collection, sleeping for ${this.timeout / 1000}s`
      );
    }
  }

  /**
   * Syncs profile metadata to database
   */
  async syncProfiles() {
    // Collect all users that have not been checked (250 at a time)
    const users: { address: string }[] = await this.db.user.findMany({
      orderBy: {
        // Get highest supply users first
        supply: "desc",
      },
      select: {
        address: true,
      },
      where: {
        profileChecked: false,
      },
      take: 250,
    });

    logger.info(`Collected ${users.length} to collect profile info`);

    // For each user
    for (const user of users) {
      // Sync metadata
      await this.syncUser(user.address);
    }
  }

  async sync() {
    await this.syncProfiles();

    logger.info("Sleeping metadata sync for 1m");
    setTimeout(() => this.syncProfiles, 1000 * 60 * 60);
  }
}
