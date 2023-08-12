import db from "../prisma/index";
import logger from "./utils/logger";
import constants from "./utils/constants";
import axios, { type AxiosInstance } from "axios";

export default class Profile {
  // Kosetto API client
  client: AxiosInstance;

  /**
   * Create profile manager
   */
  constructor() {
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
        await db.user.update({
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
        await db.user.update({
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

      // Log user
      logger.info(`Profile: collected @${data.twitterUsername}: ${address}`);
    } catch {
      logger.error(`Error on profile collection, skipping`);
      // Do nothing for now
    }
  }

  /**
   * Syncs profile metadata to database
   */
  async syncProfiles() {
    // Collect all users that have not been checked
    const users: { address: string }[] = await db.user.findMany({
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
