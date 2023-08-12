import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import axios from "axios";
import Card from "components/Card";
import { truncateAddress } from "utils";
import { formatDistance } from "date-fns";
import type { Trade } from "@prisma/client";
import { useState, useEffect } from "react";

export default function RecentTrades({
  trades: defaultTrades,
}: {
  trades: Trade[];
}) {
  // Trades
  const [trades, setTrades] = useState<Trade[]>(defaultTrades);
  const [_, setLastCheck] = useState<number>(+new Date() / 1000);
  const [timeSince, setTimeSince] = useState<number>(0);

  /**
   * Collect trades and update
   */
  async function updateTrades() {
    const {
      data: { trades },
    } = await axios.get("/api/stats/trades");
    setTrades(trades);
  }

  // Collect new trades every 15s
  useEffect(() => {
    async function run() {
      await updateTrades();
      setLastCheck(+new Date() / 1000);
      setTimeSince(0);
    }

    // Update every 15s
    const interval = setInterval(() => run(), 1000 * 15);
    return () => clearInterval(interval);
  }, []);

  // Update time since
  useEffect(() => {
    // Increment time since each second
    const interval = setInterval(
      () => setTimeSince((previous) => previous + 1),
      1 * 1000
    );

    // Clear on dismount
    return () => clearInterval(interval);
  }, []);

  return (
    <Card title={`Recent Trades (updated ${timeSince}s ago)`}>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hash</TableHead>
              <TableHead>Time Since</TableHead>
              <TableHead>Block #</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Net</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade, i) => (
              <TableRow key={i}>
                <TableCell>
                  <a
                    href={`https://basescan.org/tx/${trade.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {truncateAddress(trade.hash, 12)}
                  </a>
                </TableCell>
                <TableCell suppressHydrationWarning={true}>
                  {formatDistance(
                    new Date(trade.timestamp * 1000),
                    new Date(),
                    {
                      addSuffix: true,
                    }
                  )}
                </TableCell>
                <TableCell>
                  <a
                    href={`https://basescan.org/block/${trade.blockNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {trade.blockNumber}
                  </a>
                </TableCell>
                <TableCell>
                  <a
                    href={`https://basescan.org/block/${trade.fromAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {truncateAddress(trade.fromAddress, 10)}
                  </a>
                </TableCell>
                <TableCell>
                  <a
                    href={`https://basescan.org/block/${trade.subjectAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {truncateAddress(trade.subjectAddress, 10)}
                  </a>
                </TableCell>
                <TableCell>
                  {trade.isBuy ? "+" : "-"}
                  {trade.amount}
                </TableCell>
                <TableCell>
                  {trade.isBuy ? (
                    <span className="text-buy">
                      {Number(trade.cost) / 1e18} ETH
                    </span>
                  ) : (
                    <span className="text-sell">
                      {Number(trade.cost) / 1e18} ETH
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
