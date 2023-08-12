import Card from "components/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import { truncateAddress } from "utils";

export default function RealizedProfit({
  profit,
}: {
  profit: { address: string; profit: number }[];
}) {
  return (
    <Card title="Realized Profit (updated every 30m)">
      <div>
        <Table>
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
                  <a
                    href={`https://basescan.org/address/${p.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {truncateAddress(p.address, 8)}
                  </a>
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
