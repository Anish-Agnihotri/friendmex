import Card from "components/Card";
import { renderTimeSince } from "utils/time";
import TradeTable from "components/TradeTable";
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
        <TradeTable trades={trades} />
      </div>
    </Card>
  );
}
