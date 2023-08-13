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
import Address from "components/Address";
import { useState, useEffect } from "react";
import { Input } from "components/ui/input";
import { usePollData } from "utils/usePollData";
import User from "components/User";
import { renderTimeSince } from "utils/time";

export default function Leaderboard({
  leaderboard: ssrLeaderboard,
}: {
  leaderboard: any;
}) {
  // Local state
  const [search, setSearch] = useState<string>("");

  // Backend data
  const { data: leaderboard, lastChecked } = usePollData(
    "/api/stats/leaderboard",
    ssrLeaderboard,
    15 * 1000
  );

  console.log(leaderboard);

  return (
    <Card title="Discover" updated={`${renderTimeSince(lastChecked)} ago`}>
      <div className="relative">
        {/* Search users */}
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search friends..."
          className="h-8 w-[calc(100%-2px)] fixed focus-visible:ring-0 shadow-none border-l-0 border-r-0 border-t-0 border-b rounded-none bg-zinc-100"
        />

        <div className="pt-11 pb-3 px-3 flex flex-col gap-3">
          {leaderboard.map((user: any, i: number) => (
            <User key={i} data={user} />
          ))}
        </div>
      </div>
    </Card>
  );
  // const [users, setUsers] = useState<(User & { cost: number })[]>(defaultUsers);
  // const [_, setLastCheck] = useState<number>(+new Date() / 1000);
  // const [timeSince, setTimeSince] = useState<number>(0);

  // /**
  //  * Collect users and update
  //  */
  // async function updateUsers() {
  //   const {
  //     data: { users },
  //   } = await axios.get("/api/stats/leaderboard");
  //   setUsers(users);
  // }

  // // Collect new users every 15s
  // useEffect(() => {
  //   async function run() {
  //     await updateUsers();
  //     setLastCheck(+new Date() / 1000);
  //     setTimeSince(0);
  //   }

  //   // Update every 15s
  //   const interval = setInterval(() => run(), 1000 * 15);
  //   return () => clearInterval(interval);
  // }, []);

  // // Update time since
  // useEffect(() => {
  //   // Increment time since each second
  //   const interval = setInterval(
  //     () => setTimeSince((previous) => previous + 1),
  //     1 * 1000
  //   );

  //   // Clear on dismount
  //   return () => clearInterval(interval);
  // }, []);

  // return (
  //   <Card title="Discover">
  //     <div>
  //       <Table className="[&_td]:py-0.5">
  //         <TableHeader>
  //           <TableRow>
  //             <TableHead>User</TableHead>
  //             <TableHead>Supply</TableHead>
  //             <TableHead>Price</TableHead>
  //           </TableRow>
  //         </TableHeader>
  //         <TableBody>
  //           {users.map((user, i) => (
  //             <TableRow key={i}>
  //               <TableCell>
  //                 <Address
  //                   address={user.address}
  //                   username={user.twitterUsername}
  //                   image={user.twitterPfpUrl}
  //                   numTruncate={8}
  //                 />
  //               </TableCell>
  //               <TableCell>{user.supply}</TableCell>
  //               <TableCell>{user.cost.toFixed(2)} ETH</TableCell>
  //             </TableRow>
  //           ))}
  //         </TableBody>
  //       </Table>
  //     </div>
  //   </Card>
  // );
}
