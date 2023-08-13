import Card from "components/Card";
import { truncateAddress } from "utils";
import { LineChart } from "@tremor/react";
import { renderTimeSince } from "utils/time";
import { usePollData } from "utils/usePollData";
import { Global, StateUser } from "state/global";

export default function Chart() {
  // Token address
  const { user }: { user: StateUser } = Global.useContainer();
  // Data
  const { data, lastChecked } = usePollData<
    { timestamp: number; "Price (ETH)": number }[]
  >(`/api/token/chart?address=${user.address}`, [], 15 * 1000);

  return (
    <Card
      title="Token Chart"
      updated={`${
        user.username ? `@${user.username}` : truncateAddress(user.address, 6)
      }, ${renderTimeSince(lastChecked)} ago`}
    >
      <div className="w-full h-full p-4">
        <LineChart
          className="h-full"
          data={data}
          index="timestamp"
          categories={["Price (ETH)"]}
        />
      </div>
    </Card>
  );
}
