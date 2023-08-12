import Layout from "components/Layout";
import GridLayout from "react-grid-layout";
import type { User } from "@prisma/client";
import { useEffect, useState } from "react";

// Trading views
import Chart from "components/trading/Chart";
import BuySell from "components/trading/BuySell";
import Leaderboard from "components/trading/Leaderboard";
import NewestUsers from "components/trading/NewestUsers";
import RecentTrades from "components/trading/RecentTrades";
import RealizedProfit from "components/trading/ProfitableUsers";
import RecentUserTrades from "components/trading/RecentUserTrades";
import RecentTokenTrades from "components/trading/RecentTokenTrades";
import { getNewestUsers } from "./api/stats/newest";

export default function Home({ newestUsers }: { newestUsers: User[] }) {
  // Window width
  const [width, setWidth] = useState(0);

  /**
   * Set window size = innerWidth
   */
  const setWindowWidth = () => {
    console.log(window.innerWidth);
    setWidth(window.innerWidth);
  };

  // Collect window size
  useEffect(() => {
    // On mount
    setWindowWidth();

    // On resize
    window.addEventListener("resize", setWindowWidth);
    return () => window.removeEventListener("resize", setWindowWidth);
  }, []);

  const layout = [
    { i: "chart", x: 0, y: 0, w: 20, h: 3 },
    { i: "buy_sell", x: 20, y: 0, w: 8, h: 3 },
    { i: "leaderboard", x: 28, y: 0, w: 8, h: 3 },
    { i: "recent_trades", x: 0, y: 6, w: 9, h: 3 },
    { i: "recent_token_trades", x: 9, y: 6, w: 9, h: 3 },
    { i: "realized_profit", x: 18, y: 6, w: 9, h: 3 },
    { i: "newest_users", x: 27, y: 6, w: 9, h: 3 },
    { i: "user_trades", x: 0, y: 12, w: 36, h: 3 },
  ];

  return (
    <Layout>
      <GridLayout layout={layout} cols={36} width={width}>
        {/* Trading chart */}
        <div key="chart">
          <Chart />
        </div>

        {/* Buy + Sell controller */}
        <div key="buy_sell">
          <BuySell />
        </div>

        {/* Leaderboard */}
        <div key="leaderboard">
          <Leaderboard />
        </div>

        {/* Recent trades */}
        <div key="recent_trades">
          <RecentTrades />
        </div>

        {/* Recent token trades */}
        <div key="recent_token_trades">
          <RecentTokenTrades />
        </div>

        {/* Most profitable users */}
        <div key="realized_profit">
          <RealizedProfit />
        </div>

        {/* Newest users */}
        <div key="newest_users">
          <NewestUsers users={newestUsers} />
        </div>

        {/* User trades */}
        <div key="user_trades">
          <RecentUserTrades />
        </div>
      </GridLayout>
    </Layout>
  );
}

export async function getServerSideProps() {
  // Collect data
  const newestUsers = await getNewestUsers();

  return {
    props: {
      newestUsers,
    },
  };
}
