import axios from "axios";
import Card from "components/Card";
import Address from "components/Address";
import { formatDistance } from "date-fns";
import { useState, useEffect } from "react";
import User, { type UserInfo } from "components/User";
import { usePollData } from "utils/usePollData";
import { renderTimeSince } from "utils/time";

export default function NewestUsers({
  users: ssrUsers,
}: {
  users: UserInfo[];
}) {
  // Newest users list
  const { data: users, lastChecked } = usePollData(
    "/api/stats/newest",
    ssrUsers,
    15 * 1000
  );

  return (
    <Card title="Newest users" updated={`${renderTimeSince(lastChecked)} ago`}>
      <div className="flex flex-col p-3 gap-3">
        {users.map((user: UserInfo, i: number) => (
          <User key={i} data={user} />
        ))}
      </div>
    </Card>
  );
}
