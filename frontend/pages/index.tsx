import Layout from "components/Layout";
import type { User, Trade } from "@prisma/client";
import { WidthProvider, Responsive } from "react-grid-layout";

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
import { TradeWithTwitterUser, getLatestTrades } from "./api/stats/trades";
import { getLeaderboardUsers } from "./api/stats/leaderboard";
import {
  type RealizedProfitUser,
  getRealizedProfits,
} from "./api/stats/realized";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Home({
  newestUsers,
  latestTrades,
  leaderboardUsers,
  realizedProfit,
}: {
  newestUsers: User[];
  latestTrades: TradeWithTwitterUser[];
  leaderboardUsers: (User & { cost: number })[];
  realizedProfit: RealizedProfitUser[];
}) {
  // Layout setting
  const layout = {
    md: [
      { i: "chart", x: 0, y: 0.6, w: 24, h: 3 },
      { i: "leaderboard", x: 6.6, y: 0, w: 24, h: 3 },
      { i: "recent_trades", x: 9.6, y: 0, w: 24, h: 3 },
      { i: "buy_sell", x: 3.6, y: 0, w: 24, h: 3 },
      { i: "recent_token_trades", x: 12, y: 0, w: 24, h: 3 },
      { i: "realized_profit", x: 15.6, y: 0, w: 24, h: 3 },
      { i: "newest_users", x: 18.6, y: 0, w: 24, h: 3 },
    ],
    lg: [
      { i: "chart", x: 0, y: 0, w: 20, h: 3 },
      { i: "buy_sell", x: 20, y: 0, w: 8, h: 3 },
      { i: "leaderboard", x: 28, y: 0, w: 8, h: 3 },
      { i: "recent_trades", x: 0, y: 6, w: 36, h: 3 },
      { i: "recent_token_trades", x: 0, y: 12, w: 18, h: 3 },
      { i: "realized_profit", x: 18, y: 12, w: 9, h: 3 },
      { i: "newest_users", x: 27, y: 12, w: 9, h: 3 },
    ],
  };

  return (
    <Layout>
      <ResponsiveGridLayout
        layouts={layout}
        cols={{ lg: 36, md: 24, sm: 12, xs: 6, xxs: 3 }}
      >
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
      </ResponsiveGridLayout>
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
