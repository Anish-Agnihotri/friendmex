import axios from "axios";
import Card from "components/Card";
import { Global, StateUser } from "state/global";
import { LineChart } from "@tremor/react";
import { useState, useEffect, useCallback } from "react";
import { truncateAddress } from "utils";

export default function Chart() {
  // Token address
  const { user }: { user: StateUser } = Global.useContainer();
  // Data
  const [data, setData] = useState<{ timestamp: number; cost: number }[]>([]);

  /**
   * Collect chart from API backend
   */
  const collectChart = useCallback(async () => {
    const {
      data: { data },
    } = await axios.post("/api/token/chart", {
      address: user.address,
    });
    setData(data);
  }, [user]);

  // On address change, collect trades
  useEffect(() => {
    async function run() {
      await collectChart();
    }

    run();
  }, [user, collectChart]);

  // On page load
  useEffect(() => {
    async function run() {
      await collectChart();
    }

    run();
  }, [collectChart]);

  return (
    <Card
      title={`Token Chart (${
        user.username ? `@${user.username}` : truncateAddress(user.address, 6)
      })`}
    >
      <div className="w-full h-full p-4">
        {data && (
          <LineChart
            className="h-full"
            data={data}
            index="timestamp"
            categories={["Price (ETH)"]}
          />
        )}
      </div>
    </Card>
  );
}
