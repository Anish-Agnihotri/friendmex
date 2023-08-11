import Redis from "ioredis";
import { ethers } from "ethers";
import db from "../prisma/index";
import logger from "./utils/logger";
import { getPrice } from "./utils/math";
import constants from "./utils/constants";
import axios, { type AxiosInstance } from "axios";

export default class Keeper {
  // Redis cache
  private redis: Redis;
  // RPC client
  private rpc: AxiosInstance;
  // All tracked user address
  private users: Set<string> = new Set();
  // User to token supply (address => token supply)
  private supply: Record<string, number> = {};

  /**
   * Create new Keeper
   * @param {string} rpc_url Base RPC
   * @param {string} redis_url Cache URL
   */
  constructor(rpc_url: string, redis_url: string) {
    this.redis = new Redis(redis_url);
    this.rpc = axios.create({
      baseURL: rpc_url,
    });
  }

  /**
   * Get chain head number
   * @returns {Promise<number>} block number
   */
  async getChainBlock(): Promise<number> {
    try {
      // Send request
      const { data } = await this.rpc.post("/", {
        id: 0,
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
      });

      // Parse hex to number
      return Number(data.result);
    } catch {
      logger.error("Failed to collect chain head number");
      throw new Error("Could not collect chain head number");
    }
  }

  /**
   * Get latest synced block from cache
   * @returns {Promise<number>} block number
   */
  async getSyncedBlock(): Promise<number> {
    // Get value from cache
    const value: string | null = await this.redis.get("synced_block");

    // If value exists
    return value
      ? // Return numeric
        Number(value)
      : // Else return 1 block before contract deploy
        constants.CONTRACT_DEPLOY_BLOCK - 1;
  }

  /**
   * Loads user addresses and token supplies from backend
   */
  async loadUsersAndSupplies(): Promise<void> {
    // Collect all users from database
    const users: { address: string; supply: number }[] = await db.user.findMany(
      {
        select: {
          address: true,
          supply: true,
        },
      }
    );

    for (const user of users) {
      // Assign to list of users
      this.users.add(user.address);
      // Assign to local supply cache
      this.supply[user.address] = user.supply;
    }

    logger.info(`Loaded ${users.length} users locally`);
  }

  /**
   * Calculates trade cost based on bonding curve
   * @param {string} subject address
   * @param {number} amount to buy or sell
   * @param {boolean} buy is a buy tx or a sell tx
   * @returns {number} cost
   */
  getTradeCost(subject: string, amount: number, buy: boolean): number {
    // If subject supply is not tracked locally
    if (!this.supply.hasOwnProperty(subject)) {
      // Update to 0
      this.supply[subject] = 0;
    }

    if (buy) {
      // Return price to buy tokens
      const cost = getPrice(this.supply[subject], amount);
      const fees = cost * constants.FEE * 2;
      return cost + fees;
    } else {
      // Return price to sell tokens
      const cost = getPrice(this.supply[subject] - amount, amount);
      const fees = cost * constants.FEE * 2;
      return cost - fees;
    }
  }

  /**
   * Syncs trades between a certain range of blocks
   * @param {number} startBlock beginning index
   * @param {number} endBlock ending index
   */
  async syncTradeRange(startBlock: number, endBlock: number): Promise<void> {
    // Create block + transaction collection requests
    const numBlocks: number = endBlock - startBlock;
    logger.info(`Collecting ${numBlocks} blocks: ${startBlock} -> ${endBlock}`);

    // Create batch requests array
    const requests = new Array(numBlocks).fill(0).map((_, i: number) => ({
      method: "eth_getBlockByNumber",
      // Hex block number, true => return all transactions
      params: [`0x${(startBlock + i).toString(16)}`, true],
      id: i,
      jsonrpc: "2.0",
    }));

    // Execute request
    const {
      data,
    }: {
      data: {
        result: {
          number: string;
          timestamp: string;
          transactions: {
            hash: string;
            to: string;
            from: string;
            input: string;
          }[];
        };
      }[];
    } = await this.rpc.post("/", requests);

    // Setup contract
    const contractAddress: string = constants.CONTRACT_ADDRESS.toLowerCase();
    const contractSignatures: string[] = [
      constants.SIGNATURES.BUY,
      constants.SIGNATURES.SELL,
    ];

    // Filter for transactions that are either BUY or SELL to Friend.tech contract
    let txs: {
      hash: string;
      timestamp: number;
      blockNumber: number;
      from: string;
      subject: string;
      isBuy: boolean;
      amount: number;
      cost: number;
    }[] = [];
    // List of users with modified supply balances
    let userDiff: Set<string> = new Set();
    // List of new users altogether
    let newUsers: Set<string> = new Set();
    for (const block of data) {
      // For each transaction in block
      for (const tx of block.result.transactions) {
        if (
          // If transaction is to contract
          tx.to === contractAddress &&
          // And, transaction is of format buyShares or sellShares
          contractSignatures.includes(tx.input.slice(0, 10))
        ) {
          // Decode tx input
          const result = ethers.utils.defaultAbiCoder.decode(
            ["address", "uint256"],
            ethers.utils.hexDataSlice(tx.input, 4)
          );

          // Collect params and create tx
          const subject: string = result[0].toLowerCase();
          const amount: number = result[1].toNumber();
          const isBuy: boolean =
            tx.input.slice(0, 10) === constants.SIGNATURES.BUY;

          // Calculate cost of transaction
          const cost: number = this.getTradeCost(subject, amount, isBuy);

          // Push newly tracked transaction
          const transaction = {
            hash: tx.hash,
            timestamp: Number(block.result.timestamp),
            blockNumber: Number(block.result.number),
            from: tx.from.toLowerCase(),
            subject,
            isBuy,
            amount,
            cost: Math.trunc(cost * 1e18),
          };
          txs.push(transaction);

          // Apply user token supply update
          if (isBuy) {
            this.supply[subject] += amount;
          } else {
            this.supply[subject] -= amount;
          }
          // Track user with supply diff
          userDiff.add(subject);

          // Track new users
          if (!this.users.has(transaction.from)) {
            this.users.add(transaction.from);
            newUsers.add(transaction.from);
          }
          if (!this.users.has(transaction.subject)) {
            this.users.add(transaction.subject);
            newUsers.add(transaction.subject);
          }
        }
      }
    }

    logger.info(`Collected ${txs.length} transactions`);

    // Setup subject updates
    let subjectUpserts = [];
    for (const subject of new Set([...userDiff, ...newUsers])) {
      subjectUpserts.push(
        db.user.upsert({
          where: {
            address: subject,
          },
          create: {
            address: subject,
            supply: this.supply[subject] ?? 0,
          },
          update: {
            supply: this.supply[subject] ?? 0,
          },
        })
      );
    }

    // Setup trade updates
    let tradeInsert = db.trade.createMany({
      data: txs.map((tx) => ({
        hash: tx.hash,
        timestamp: tx.timestamp,
        blockNumber: tx.blockNumber,
        fromAddress: tx.from,
        subjectAddress: tx.subject,
        isBuy: tx.isBuy,
        amount: tx.amount,
        cost: tx.cost,
      })),
    });

    // Insert subjects and trades as atomic transaction
    await db.$transaction([...subjectUpserts, tradeInsert]);
    logger.info(
      `Added ${subjectUpserts.length} subject updates, ${txs.length} trades`
    );

    // Update latest synced block
    const ok = await this.redis.set("synced_block", endBlock);
    if (!ok) {
      logger.error("Error storing synced_block in cache");
      throw new Error("Could not synced_block store in Redis");
    }
    logger.info(`Set last synced block to ${endBlock}`);
  }

  async syncTrades() {
    // Latest blocks
    const latestChainBlock: number = await this.getChainBlock();
    const latestSyncedBlock: number = await this.getSyncedBlock();

    // Calculate remaining blocks to sync
    const diffSync: number = latestChainBlock - latestSyncedBlock;
    logger.info(`Remaining blocks to sync: ${diffSync}`);

    // If diff > 0, poll by 100 blocks at a time
    if (diffSync > 0) {
      // Max 100 blocks to collect
      const numToSync: number = Math.min(diffSync, 100);

      // (Start, End) sync blocks
      let startBlock: number = latestSyncedBlock;
      let endBlock: number = latestSyncedBlock + numToSync;

      // Sync between block ranges
      try {
        // Sync start -> end blocks
        await this.syncTradeRange(startBlock, endBlock);
        // Recursively resync if diffSync > 0
        await this.syncTrades();
      } catch (e) {
        logger.error("Error when syncing between range", e);
        throw new Error("Error when syncing between range");
      }
    }
  }

  async sync() {
    // Sync users and token supplies if first startup
    if (Object.keys(this.supply).length === 0) {
      await this.loadUsersAndSupplies();
    }

    // Sync trades
    await this.syncTrades();

    // Recollect in 5s
    logger.info("Sleeping for 5s");
    setTimeout(() => this.sync(), 1000 * 5);
  }
}
