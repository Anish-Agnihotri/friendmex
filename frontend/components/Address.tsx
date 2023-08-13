import { Global } from "state/global";
import { Button } from "./ui/button";
import { truncateAddress } from "utils";

export default function Address({
  address,
  username,
  image,
}: {
  address: string;
  username?: string | null;
  image?: string | null;
}) {
  // Global state
  const global = Global.useContainer();

  // Conditional renders
  const name: string | null | undefined =
    username && username.length > 20 ? username?.slice(0, 20) : username;
  const user: string = username ? `@${name}` : truncateAddress(address, 6);

  return (
    <Button
      onClick={() => global.setUser({ address, username, image })}
      className="h-8 pl-1 pr-2 py-0 bg-white border text-black rounded-md shadow-none text-sm font-normal hover:bg-white hover:opacity-70 transition-opacity"
    >
      <div className="flex items-center">
        <img
          src={image ? image : "/rasters/default.png"}
          width={22}
          height={22}
          alt={`${user} Twitter pfp`}
          className="rounded-md"
        />
        <span className="pl-2">{user}</span>
      </div>
    </Button>
  );
}
