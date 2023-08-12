import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "components/ui/table";
import axios from "axios";
import Card from "components/Card";
import Address from "components/Address";
import { formatDistance } from "date-fns";
import type { User } from "@prisma/client";
import { useState, useEffect } from "react";

export default function NewestUsers({
  users: defaultUsers,
}: {
  users: User[];
}) {
  // Newest users list
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [_, setLastCheck] = useState<number>(+new Date() / 1000);
  const [timeSince, setTimeSince] = useState<number>(0);

  /**
   * Collect users and update
   */
  async function updateUsers() {
    const {
      data: { users },
    } = await axios.get("/api/stats/newest");
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
    <Card title={`Newest Users (updated ${timeSince}s ago)`}>
      <div>
        <Table className="[&_td]:py-0.5">
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Supply</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Address address={user.address} numTruncate={8} />
                </TableCell>
                <TableCell>{user.supply}</TableCell>
                <TableCell suppressHydrationWarning={true}>
                  {formatDistance(new Date(user.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
