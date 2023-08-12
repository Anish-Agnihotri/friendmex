import { Global } from "state/global";
import { Button } from "./ui/button";
import { truncateAddress } from "utils";

export default function Address({
  address,
  numTruncate,
}: {
  address: string;
  numTruncate: number;
}) {
  // Global state
  const global = Global.useContainer();

  return (
    <Button
      onClick={() => global.setAddress(address)}
      className="p-0 bg-transparent text-black border-none rounded-none shadow-none text-sm font-normal underline hover:bg-transparent hover:opacity-70 transition-opacity"
    >
      {truncateAddress(address, numTruncate)}
    </Button>
  );
}
