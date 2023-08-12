import Layout from "components/Layout";
import GridLayout from "react-grid-layout";
import Leaderboard from "components/trading/Leaderboard";

export default function Home() {
  const layout = [{ i: "leaderboard", x: 0, y: 0, w: 12, h: 3 }];

  return (
    <Layout>
      <GridLayout layout={layout} cols={36} width={1800}>
        <div key="leaderboard">
          <Leaderboard />
        </div>
      </GridLayout>
    </Layout>
  );
}
