import Address from "components/Address";
import Card from "components/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";

export default function RealizedProfit({
  profit,
}: {
  profit: { address: string; profit: number }[];
}) {
  return (
    <Card title="Realized Profit (updated every 30m)">
      <div>
        <Table className="[&_td]:py-0.5">
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profit.map((p, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Address address={p.address} numTruncate={8} />
                </TableCell>
                <TableCell>
                  {p.profit > 0 ? (
                    <span className="text-buy">{p.profit.toFixed(2)} ETH</span>
                  ) : (
                    <span className="text-sell">{p.profit.toFixed(2)} ETH</span>
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
