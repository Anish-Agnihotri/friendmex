import Card from "components/Card";
import { Global } from "state/global";
import { renderTimeSince } from "utils/time";
import { usePollData } from "utils/usePollData";
import User, { type UserInfo } from "components/User";
import { CrossCircledIcon, SymbolIcon } from "@radix-ui/react-icons";

export default function Favorites() {
  // Favorites list
  const { favorites } = Global.useContainer();
  // Backend data
  const { data, lastChecked, loading } = usePollData<UserInfo[]>(
    `/api/user?address=${Object.keys(favorites).join("&address=")}`,
    [],
    15 * 1000
  );

  return (
    <Card title="Favorites" updated={`${renderTimeSince(lastChecked)} ago`}>
      <div className="h-full relative">
        <div className="p-3 flex">
          {Object.keys(favorites).length === 0 ? (
            // No favorites saved
            <div className="pt-4 flex flex-col w-full items-center text-zinc-500">
              <CrossCircledIcon className="h-8 w-8" />
              <span className="pt-2 text-sm pr-2">No favorites saved</span>
            </div>
          ) : loading && data.length === 0 ? (
            <div className="pt-4 flex flex-col w-full items-center text-zinc-500">
              <SymbolIcon className="h-8 w-8 animate-spin" />
              <span className="pt-2 text-sm pr-2">Loading favorites...</span>
            </div>
          ) : data.length === 0 ? (
            // No favorites found
            <div className="pt-4 flex flex-col w-full items-center text-zinc-500">
              <CrossCircledIcon className="h-8 w-8" />
              <span className="pt-2 text-sm pr-2">No favorites found</span>
            </div>
          ) : (
            // Favorites data
            <div className="flex w-full flex-col gap-y-3">
              {data.map((user: UserInfo, i: number) => (
                <User key={i} data={user} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
