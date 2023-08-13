import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import Card from "components/Card";
import { truncateAddress } from "utils";
import Address from "components/Address";
import { formatDistance } from "date-fns";
import { renderTimeSince } from "utils/time";
import { usePollData } from "utils/usePollData";
import type { TradeWithTwitterUser } from "pages/api/stats/trades";

export default function RecentTrades({
  trades: ssrTrades,
}: {
  trades: TradeWithTwitterUser[];
}) {
  const { data: trades, lastChecked } = usePollData(
    "/api/stats/trades",
    ssrTrades,
    15 * 1000
  );

  return (
    <Card title="Recent trades" updated={`${renderTimeSince(lastChecked)} ago`}>
      <div>
        <Table className="[&_td]:py-1">
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
                  <Address
                    address={trade.fromAddress}
                    username={trade.fromUser.twitterUsername}
                    image={trade.fromUser.twitterPfpUrl}
                  />
                </TableCell>
                <TableCell>
                  <Address
                    address={trade.subjectAddress}
                    username={trade.subjectUser.twitterUsername}
                    image={trade.subjectUser.twitterPfpUrl}
                  />
                </TableCell>
                <TableCell>
                  {trade.isBuy ? "+" : "-"}
                  {trade.amount}
                </TableCell>
                <TableCell>
                  {trade.isBuy ? (
                    <span className="text-buy">
                      {(Number(trade.cost) / 1e18).toFixed(6)} Ξ
                    </span>
                  ) : (
                    <span className="text-sell">
                      {(Number(trade.cost) / 1e18).toFixed(6)} Ξ
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
