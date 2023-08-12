import axios from "axios";
import Card from "components/Card";
import { Global } from "state/global";
import { LineChart } from "@tremor/react";
import { useState, useEffect, useCallback } from "react";

export default function Chart() {
  // Token address
  const { address }: { address: string } = Global.useContainer();
  // Data
  const [data, setData] = useState<{ timestamp: number; cost: number }[]>([]);

  /**
   * Collect chart from API backend
   */
  const collectChart = useCallback(async () => {
    const {
      data: { data },
    } = await axios.post("/api/token/chart", {
      address,
    });
    setData(data);
  }, [address]);

  // On address change, collect trades
  useEffect(() => {
    async function run() {
      await collectChart();
    }

    run();
  }, [address, collectChart]);

  // On page load
  useEffect(() => {
    async function run() {
      await collectChart();
    }

    run();
  }, [collectChart]);

  return (
    <Card title="Token Chart">
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
