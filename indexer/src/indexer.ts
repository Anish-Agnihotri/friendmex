import { base } from "viem/chains";
import { base as baseType } from "@wagmi/chains";
import { HttpTransport, PublicClient, createPublicClient, http } from "viem";

const FRIEND_TECH_START_BLOCK: number = 2430440;

export default class Indexer {
  // Base RPC client
  rpc: PublicClient<HttpTransport, typeof baseType>;

  /**
   * Create new indexer
   * @param {string} rpc_url for Base chain
   */
  constructor(rpc_url: string) {
    // Create viem client
    // @ts-ignore
    this.rpc = createPublicClient({
      chain: base,
      transport: http(rpc_url),
    });
  }

  async getLatestBaseBlock(): Promise<BigInt> {
    return await this.rpc.getBlockNumber();
  }

  async sync() {
    console.log(await this.getLatestBaseBlock());
  }
}
