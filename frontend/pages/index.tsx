import dynamic from "next/dynamic";
import Layout from "components/Layout";
import constants from "utils/constants";
import type { StateUser } from "state/global";
import { WidthProvider, Responsive } from "react-grid-layout";

// Trading views
import Chart from "components/trading/Chart";
import Discover from "components/trading/Discover";
import NewestUsers from "components/trading/NewestUsers";
import RecentTrades from "components/trading/RecentTrades";
import RealizedProfit from "components/trading/ProfitableUsers";
import RecentTokenTrades from "components/trading/RecentTokenTrades";

// API
import { getNewestUsers } from "./api/stats/newest";
import { type TradeWithTwitterUser, getLatestTrades } from "./api/stats/trades";
import { getLeaderboardUsers } from "./api/stats/leaderboard";
import {
  type RealizedProfitUser,
  getRealizedProfits,
} from "./api/stats/realized";
import type { UserInfo } from "components/User";
import type { NextPageContext } from "next";
import { getStateUser } from "./api/user";
import Favorites from "components/trading/Favorites";

const ResponsiveGridLayout = WidthProvider(Responsive);
const BuySell = dynamic(() => import("components/trading/BuySell"), {
  ssr: false,
});
const Holdings = dynamic(() => import("components/trading/Holdings"), {
  ssr: false,
});

export default function Home({
  newestUsers,
  latestTrades,
  leaderboardUsers,
  realizedProfit,
  user,
}: {
  newestUsers: UserInfo[];
  latestTrades: TradeWithTwitterUser[];
  leaderboardUsers: UserInfo[];
  realizedProfit: RealizedProfitUser[];
  user: StateUser;
}) {
  // Layout setting
  const layout = {
    md: [
      { i: "chart", x: 0, y: 0.6, w: 24, h: 3 },
      { i: "discover", x: 6.6, y: 0, w: 24, h: 3 },
      { i: "holdings", x: 21.6, y: 24, w: 24, h: 3 },
      { i: "favorites", x: 21.6, y: 24, w: 24, h: 3 },
      { i: "recent_trades", x: 9.6, y: 0, w: 24, h: 3 },
      { i: "buy_sell", x: 3.6, y: 0, w: 24, h: 3 },
      { i: "recent_token_trades", x: 12, y: 0, w: 24, h: 3 },
      { i: "realized_profit", x: 15.6, y: 0, w: 24, h: 3 },
      { i: "newest_users", x: 18.6, y: 0, w: 24, h: 3 },
    ],
    lg: [
      { i: "chart", x: 0, y: 0, w: 20, h: 3 },
      { i: "buy_sell", x: 20, y: 0, w: 8, h: 3 },
      { i: "discover", x: 28, y: 0, w: 8, h: 3 },
      { i: "recent_trades", x: 0, y: 6, w: 28, h: 3 },
      { i: "favorites", x: 28, y: 6, w: 8, h: 3 },
      { i: "recent_token_trades", x: 0, y: 12, w: 18, h: 3 },
      { i: "realized_profit", x: 18, y: 18, w: 9, h: 3 },
      { i: "newest_users", x: 27, y: 18, w: 9, h: 3 },
      { i: "holdings", x: 0, y: 24, w: 36, h: 3 },
    ],
  };

  return (
    <Layout user={user}>
      <ResponsiveGridLayout
        layouts={layout}
        draggableHandle=".drag-handle"
        cols={{ lg: 36, md: 24, sm: 12, xs: 6, xxs: 3 }}
      >
        {/* Discover */}
        <div key="discover">
          <Discover leaderboard={leaderboardUsers} />
        </div>

        {/* Trading chart */}
        <div key="chart">
          <Chart />
        </div>

        {/* Buy + Sell controller */}
        <div key="buy_sell">
          <BuySell />
        </div>

        {/* Recent trades */}
        <div key="recent_trades">
          <RecentTrades trades={latestTrades} />
        </div>

        {/* Favorites */}
        <div key="favorites">
          <Favorites />
        </div>

        {/* Portfolio */}
        <div key="holdings">
          <Holdings />
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

export async function getServerSideProps(ctx: NextPageContext) {
  // Collect query params
  let { address } = ctx.query;
  // If array, select first
  if (Array.isArray(address)) {
    address = address[0];
  }

  let user: StateUser;
  try {
    // If no address throw
    if (!address) throw new Error("No address found");

    // Collect user by address
    user = await getStateUser(address);
  } catch {
    // If error, default to Cobie
    user = constants.COBIE;
  }

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
      user,
    },
  };
}
