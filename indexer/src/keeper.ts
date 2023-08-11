import db from "@db/index";
import ethers from "ethers";
import Redis from "ioredis";
import logger from "@utils/logger";
import constants from "@utils/constants";
import axios, { type AxiosInstance } from "axios";

export default class Keeper {
  // Redis cache
  private redis: Redis;
  // RPC client
  private rpc: AxiosInstance;

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
      amount: number;
    }[] = [];
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
          const amount: number = result[1].toNumber();
          const direction: 1 | -1 =
            tx.input.slice(0, 10) === constants.SIGNATURES.BUY ? 1 : -1;

          txs.push({
            hash: tx.hash,
            timestamp: Number(block.result.timestamp),
            blockNumber: Number(block.result.number),
            from: tx.from.toLowerCase(),
            subject: result[0].toLowerCase(),
            amount: amount * direction,
          });
        }
      }
    }

    logger.info(`Found ${txs.length} transactions`);
    console.log(txs);

    // Update latest synced block
    const ok = await this.redis.set("synced_block", endBlock);
    if (!ok) {
      logger.error("Error storing synced_block in cache");
      throw new Error("Could not synced_block store in Redis");
    }
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
    // Sync trades
    await this.syncTrades();

    // Recollect in 5s
    logger.info("Sleeping for 5s");
    setTimeout(() => this.sync(), 1000 * 5);
  }
}
