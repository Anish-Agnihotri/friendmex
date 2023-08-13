import Card from "components/Card";
import { truncateAddress } from "utils";
import { renderTimeSince } from "utils/time";
import TradeTable from "components/TradeTable";
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

        {trades.length > 0 && <TradeTable trades={trades} />}
      </div>
    </Card>
  );
}
