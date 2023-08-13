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
import { Global, StateUser } from "state/global";
import { TradeWithTwitterUser } from "pages/api/stats/trades";
import { CrossCircledIcon, SymbolIcon } from "@radix-ui/react-icons";

export default function RecentTokenTrades() {
  // Token address
  const { user }: { user: StateUser } = Global.useContainer();
  // Trades
  const {
    data: trades,
    lastChecked,
    loading,
  } = usePollData<TradeWithTwitterUser[]>(
    `/api/token/trades?address=${user.address}`,
    [],
    15 * 1000
  );

  return (
    <Card
      title="Token trades"
      updated={`${
        user.username ? `@${user.username}` : truncateAddress(user.address, 6)
      }, ${renderTimeSince(lastChecked)} ago`}
    >
      <div className="h-full">
        {loading && trades.length === 0 && (
          <div className="flex mx-auto mt-4 items-center flex-col justify-center w-[calc(100%-2rem)] h-[calc(100%-2rem)] border-2 border-dashed rounded-md">
            <SymbolIcon className="h-12 w-12 animate-spin" />
            <span className="text-lg pt-2">Loading trades...</span>
          </div>
        )}

        {trades.length === 0 && (
          <div className="flex mt-4 mx-auto items-center flex-col justify-center w-[calc(100%-2rem)] h-[calc(100%-2rem)] border-2 border-dashed rounded-md">
            <CrossCircledIcon className="h-12 w-12" />
            <span className="text-lg pt-2">
              {!user.address ? "Select an address" : "No trades found"}
            </span>
          </div>
        )}

        {trades.length > 0 && (
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
                      {truncateAddress(trade.hash, 6)}
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
        )}
      </div>
    </Card>
  );
}
