import {
  ButtonIcon,
  CrossCircledIcon,
  SymbolIcon,
} from "@radix-ui/react-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import Card from "components/Card";
import { useAccount } from "wagmi";
import Address from "components/Address";
import type { User } from "@prisma/client";
import { renderTimeSince } from "utils/time";
import { usePollData } from "utils/usePollData";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Holdings() {
  // Wagmi
  const { address, isConnected } = useAccount();

  // Holdings
  const {
    data: holdings,
    lastChecked,
    loading,
  } = usePollData<(User & { balance: number })[]>(
    `/api/token/holdings?address=${address}`,
    [],
    15 * 1000
  );

  return (
    <Card title="Portfolio" updated={`${renderTimeSince(lastChecked)} ago`}>
      {!isConnected ? (
        // Not connected state
        <div className="h-full p-4">
          <div className="flex h-full flex-col items-center justify-center border border-dashed rounded-md">
            <ButtonIcon className="w-12 h-12 text-zinc-500" />
            <span className="text-zinc-500">
              Connect wallet to track holdings
            </span>
            <div className="mt-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full">
          {loading && holdings.length === 0 && (
            // Initial load
            <div className="h-full p-4">
              <div className="flex h-full flex-col items-center justify-center border border-dashed rounded-md">
                <SymbolIcon className="h-12 w-12 animate-spin" />
                <span className="text-lg pt-2">Loading portfolio...</span>
              </div>
            </div>
          )}

          {holdings.length === 0 && (
            // No holdings found
            <div className="h-full p-4">
              <div className="flex h-full flex-col items-center justify-center border border-dashed rounded-md">
                <CrossCircledIcon className="h-12 w-12" />
                <span className="text-lg pt-2">Portfolio is empty</span>
              </div>
            </div>
          )}

          {holdings.length > 0 && (
            // Some holdings found, render table
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Friend</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((holding, i: number) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Address
                        address={holding.address}
                        username={holding.twitterUsername}
                        image={holding.twitterPfpUrl}
                      />
                    </TableCell>
                    <TableCell>{holding.balance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </Card>
  );
}
