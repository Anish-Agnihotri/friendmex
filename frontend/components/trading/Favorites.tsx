import User from "components/User";
import Card from "components/Card";
import { Global, StateUser } from "state/global";
import { renderTimeSince } from "utils/time";
import { usePollData } from "utils/usePollData";
import { CrossCircledIcon, SymbolIcon } from "@radix-ui/react-icons";

const FORCED_DEFAULTS = {
  cost: 0,
  supply: 0,
  profileChecked: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function Favorites() {
  // Favorites list
  const { favorites } = Global.useContainer();
  // Backend data
  const { data, lastChecked, loading } = usePollData<StateUser[]>(
    `/api/user?address=${Object.keys(favorites).join("&address=")}`,
    [],
    15 * 1000
  );

  return (
    <Card title="Favorites" updated={`${renderTimeSince(lastChecked)} ago`}>
      <div className="h-full">
        <div className="p-3 h-full">
          {Object.keys(favorites).length === 0 ? (
            // No favorites saved
            <div className="flex h-full flex-col items-center justify-center border border-dashed rounded-md text-zinc-500">
              <CrossCircledIcon className="w-12 h-12" />
              <span className="pt-2">No favorites saved</span>
            </div>
          ) : loading && data.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center border border-dashed rounded-md text-zinc-500">
              <SymbolIcon className="h-12 w-12 animate-spin" />
              <span className="pt-2">Loading favorites...</span>
            </div>
          ) : data.length === 0 ? (
            // No favorites found
            <div className="flex h-full flex-col items-center justify-center border border-dashed rounded-md text-zinc-500">
              <CrossCircledIcon className="h-12 w-12" />
              <span className="pt-2">No favorites found</span>
            </div>
          ) : (
            // Favorites data
            <div className="flex w-full flex-col gap-y-3 pb-3">
              {data.map((user: StateUser, i: number) => (
                <User
                  key={i}
                  data={{
                    address: user.address,
                    twitterPfpUrl: user.image ?? null,
                    twitterUsername: user.username ?? null,
                    // Defaults to adhere
                    ...FORCED_DEFAULTS,
                  }}
                  isMinimal={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
