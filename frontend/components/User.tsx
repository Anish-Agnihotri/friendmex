import { Button } from "./ui/button";
import { Global } from "state/global";
import { truncateAddress } from "utils";
import type { User } from "@prisma/client";

/**
 * Extended user object including token cost
 */
export type UserInfo = User & {
  cost: number;
};

export default function User({ data }: { data: UserInfo }) {
  // Global state
  const { user, setUser } = Global.useContainer();

  // Profile image
  const image: string = data.twitterPfpUrl ?? "/rasters/default.png";
  const alt: string = data.twitterUsername
    ? `@${data.twitterUsername} profile picture`
    : `${data.address} profile picture`;

  // Username
  const address: string = truncateAddress(data.address, 6);
  const username: string = data.twitterUsername
    ? `@${data.twitterUsername}`
    : address;
  const addressLink: string = `https://basescan.org/address/${data.address}`;
  const usernameLink: string = data.twitterUsername
    ? `https://twitter.com/${data.twitterUsername}`
    : addressLink;

  // Market cap
  const marketCap: number = data.cost * data.supply;

  return (
    <div className="flex flex-col border rounded-lg bg-white">
      {/* Top section */}
      <div className="p-2 border-b flex flex-row items-center justify-between w-full">
        {/* Top left (image, handle, address) */}
        <div className="flex items-center">
          <img
            src={image}
            alt={alt}
            width={30}
            height={30}
            className="rounded-md"
          />

          <div className="flex text-xs flex-col pl-2 [&>a:hover]:opacity-70">
            {/* Username */}
            <a href={usernameLink} target="_blank" rel="noopener noreferrer">
              {username}
            </a>

            {/* Address */}
            <a
              href={addressLink}
              className="text-zinc-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              {address}
            </a>
          </div>
        </div>

        {/* Top right (trade button) */}
        <Button
          onClick={() =>
            setUser({
              address: data.address,
              username: data.twitterUsername,
              image: data.twitterPfpUrl,
            })
          }
          disabled={user.address === data.address}
          className="text-xs h-7 px-2 py-0 bg-buy hover:bg-buy hover:opacity-70 transition-opacity"
        >
          {data.cost.toFixed(4)} Ξ
        </Button>
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between px-2 py-1 text-xs text-zinc-500">
        <span>
          {data.supply} holder{data.supply == 1 ? "" : "s"}
        </span>
        <span>MC: {marketCap.toFixed(2)} Ξ</span>
      </div>
    </div>
  );
}
