import { Global } from "state/global";
import { Button } from "./ui/button";
import { truncateAddress } from "utils";

export default function Address({
  address,
  username,
  image,
  numTruncate,
}: {
  address: string;
  username?: string | null;
  image?: string | null;
  numTruncate: number;
}) {
  // Global state
  const global = Global.useContainer();

  return (
    <Button
      onClick={() => global.setAddress(address)}
      className="p-0 bg-transparent text-black border-none rounded-none shadow-none text-sm font-normal underline hover:bg-transparent hover:opacity-70 transition-opacity"
    >
      {username && image ? (
        <div className="flex items-center">
          <img
            src={image}
            width={25}
            height={25}
            alt={`${username} Twitter pfp`}
            className="rounded-full"
          />
          <span className="pl-2">@{username}</span>
        </div>
      ) : (
        <span>{truncateAddress(address, numTruncate)}</span>
      )}
    </Button>
  );
}
