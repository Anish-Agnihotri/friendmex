import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import Card from "components/Card";
import Address from "components/Address";
import { renderTimeSince } from "utils/time";
import { usePollData } from "utils/usePollData";
import { RealizedProfitUser } from "pages/api/stats/realized";

export default function RealizedProfit({
  profit: ssrProfit,
}: {
  profit: RealizedProfitUser[];
}) {
  const { data, lastChecked } = usePollData(
    "/api/stats/realized",
    ssrProfit,
    3 * 60 * 1000
  );

  return (
    <Card
      title="Realized Profit"
      updated={`${renderTimeSince(lastChecked)} ago`}
    >
      <div>
        <Table className="[&_td]:py-1">
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((p, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Address
                    address={p.address}
                    username={p.twitterUsername}
                    image={p.twitterPfpUrl}
                  />
                </TableCell>
                <TableCell>
                  {p.profit > 0 ? (
                    <span className="text-buy">{p.profit.toFixed(2)} Ξ</span>
                  ) : (
                    <span className="text-sell">{p.profit.toFixed(2)} Ξ</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
