import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import axios from "axios";
import Card from "components/Card";
import { truncateAddress } from "utils";
import type { User } from "@prisma/client";
import { useState, useEffect } from "react";

export default function Leaderboard({
  users: defaultUsers,
}: {
  users: (User & { cost: number })[];
}) {
  const [users, setUsers] = useState<(User & { cost: number })[]>(defaultUsers);
  const [_, setLastCheck] = useState<number>(+new Date() / 1000);
  const [timeSince, setTimeSince] = useState<number>(0);

  /**
   * Collect users and update
   */
  async function updateUsers() {
    const {
      data: { users },
    } = await axios.get("/api/stats/leaderboard");
    setUsers(users);
  }

  // Collect new users every 15s
  useEffect(() => {
    async function run() {
      await updateUsers();
      setLastCheck(+new Date() / 1000);
      setTimeSince(0);
    }

    // Update every 15s
    const interval = setInterval(() => run(), 1000 * 15);
    return () => clearInterval(interval);
  }, []);

  // Update time since
  useEffect(() => {
    // Increment time since each second
    const interval = setInterval(
      () => setTimeSince((previous) => previous + 1),
      1 * 1000
    );

    // Clear on dismount
    return () => clearInterval(interval);
  }, []);

  return (
    <Card title={`Friend Leaderboard (updated ${timeSince}s ago)`}>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Supply</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, i) => (
              <TableRow key={i}>
                <TableCell>
                  <a
                    href={`https://basescan.org/address/${user.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {truncateAddress(user.address, 8)}
                  </a>
                </TableCell>
                <TableCell>{user.supply}</TableCell>
                <TableCell>{user.cost.toFixed(2)} ETH</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
