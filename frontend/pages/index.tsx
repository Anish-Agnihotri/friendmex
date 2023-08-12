import Layout from "components/Layout";
import GridLayout from "react-grid-layout";
import { useEffect, useState } from "react";
import type { User, Trade } from "@prisma/client";

// Trading views
import Chart from "components/trading/Chart";
import Search from "components/trading/Search";
import BuySell from "components/trading/BuySell";
import Leaderboard from "components/trading/Leaderboard";
import NewestUsers from "components/trading/NewestUsers";
import RecentTrades from "components/trading/RecentTrades";
import RealizedProfit from "components/trading/ProfitableUsers";
import RecentTokenTrades from "components/trading/RecentTokenTrades";

// API
import { getNewestUsers } from "./api/stats/newest";
import { getLatestTrades } from "./api/stats/trades";
import { getLeaderboardUsers } from "./api/stats/leaderboard";
import { getRealizedProfits } from "./api/stats/realized";

export default function Home({
  newestUsers,
  latestTrades,
  leaderboardUsers,
  realizedProfit,
}: {
  newestUsers: User[];
  latestTrades: Trade[];
  leaderboardUsers: (User & { cost: number })[];
  realizedProfit: { address: string; profit: number }[];
}) {
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
    { i: "search", x: 0, y: 0, w: 20, h: 0.5 },
    { i: "chart", x: 0, y: 0, w: 20, h: 2.5 },
    { i: "buy_sell", x: 20, y: 0, w: 8, h: 3 },
    { i: "leaderboard", x: 28, y: 0, w: 8, h: 3 },
    { i: "recent_trades", x: 0, y: 6, w: 36, h: 3 },
    { i: "recent_token_trades", x: 0, y: 12, w: 18, h: 3 },
    { i: "realized_profit", x: 18, y: 12, w: 9, h: 3 },
    { i: "newest_users", x: 27, y: 12, w: 9, h: 3 },
  ];

  return (
    <Layout>
      <GridLayout layout={layout} cols={36} width={width}>
        {/* Search */}
        <div key="search">
          <Search />
        </div>

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
          <Leaderboard users={leaderboardUsers} />
        </div>

        {/* Recent trades */}
        <div key="recent_trades">
          <RecentTrades trades={latestTrades} />
        </div>

        {/* Recent token trades */}
        <div key="recent_token_trades">
          <RecentTokenTrades />
        </div>

        {/* Most profitable users */}
        <div key="realized_profit">
          <RealizedProfit profit={realizedProfit} />
        </div>

        {/* Newest users */}
        <div key="newest_users">
          <NewestUsers users={newestUsers} />
        </div>
      </GridLayout>
    </Layout>
  );
}

export async function getServerSideProps() {
  // Collect data
  const newestUsers = await getNewestUsers();
  const latestTrades = await getLatestTrades();
  const leaderboardUsers = await getLeaderboardUsers();
  const realizedProfit = await getRealizedProfits();

  return {
    props: {
      newestUsers,
      latestTrades,
      leaderboardUsers,
      realizedProfit,
    },
  };
}
