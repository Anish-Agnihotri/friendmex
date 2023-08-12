import axios from "axios";
import Card from "components/Card";
import { Global } from "state/global";
import type { Trade } from "@prisma/client";
import { useEffect, useState, useCallback } from "react";
import { CrossCircledIcon, SymbolIcon } from "@radix-ui/react-icons";
import { Table } from "components/ui/table";

export default function RecentTokenTrades() {
  // Loading state
  const [loading, setLoading] = useState<boolean>(true);
  // Token address
  const { address }: { address: string } = Global.useContainer();
  // Trades
  const [trades, setTrades] = useState<Trade[]>([]);

  /**
   * Collect trades from API backend
   */
  const collectTrades = useCallback(async () => {
    try {
      setLoading(true);
    } catch {
      const {
        data: { trades },
      } = await axios.post("/api/token/trades", {
        address,
      });
      console.log(trades);
      setTrades(trades);
    } finally {
      setLoading(false);
    }
  }, [address]);

  // On address change, collect trades
  useEffect(() => {
    async function run() {
      await collectTrades();
    }

    run();
  }, [address, collectTrades]);

  return (
    <Card title="Recent Token Trades">
      <div className="flex items-center h-full">
        {loading && (
          <div className="flex mx-auto items-center flex-col justify-center w-[calc(100%-2rem)] h-[calc(100%-2rem)] border-2 border-dashed rounded-md">
            <SymbolIcon className="h-12 w-12 animate-spin" />
            <span className="text-lg pt-2">Loading trades...</span>
          </div>
        )}

        {trades.length === 0 ? (
          <div className="flex mx-auto items-center flex-col justify-center w-[calc(100%-2rem)] h-[calc(100%-2rem)] border-2 border-dashed rounded-md">
            <CrossCircledIcon className="h-12 w-12" />
            <span className="text-lg pt-2">No trades found</span>
          </div>
        ) : (
          <Table></Table>
        )}
      </div>
    </Card>
  );
}
