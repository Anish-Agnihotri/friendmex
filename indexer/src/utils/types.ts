export type RPCMethod = {
  id: number;
  jsonrpc: string;
  params: any[];
  method: string;
};

export type Transaction = {
  hash: string;
  timestamp: number;
  blockNumber: number;
  from: string;
  subject: string;
  isBuy: boolean;
  amount: number;
  cost: number;
};
