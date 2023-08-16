import Card from "components/Card";
import { parseUSD } from "utils/usd";
import Address from "components/Address";
import { useEffect, useState } from "react";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import { ABI, CONTRACT_ADDRESS } from "utils";
import { Global, Currency } from "state/global";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ButtonIcon, SymbolIcon } from "@radix-ui/react-icons";
import { useAccount, useContractRead, useContractWrite } from "wagmi";

export default function BuySell() {
  // Global state
  const { eth, currency, user } = Global.useContainer();

  // Local state
  const [buy, setBuy] = useState<number>(0);
  const [sell, setSell] = useState<number>(0);

  // Wagmi
  const { address, isConnected } = useAccount();
  const { data: ownedAmount }: { data: BigInt | undefined } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "sharesBalance",
    args: [user.address, address],
  });
  const { data: buyPrice }: { data: BigInt | undefined } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getBuyPriceAfterFee",
    args: [user.address, buy],
  });
  const { data: sellPrice }: { data: BigInt | undefined } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getSellPriceAfterFee",
    args: [user.address, sell],
  });
  const { write: executeBuy, isLoading: buyLoading } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "buyShares",
    args: [user.address, buy],
    value: (buyPrice as bigint) ?? undefined,
  });
  const { write: executeSell, isLoading: sellLoading } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "sellShares",
    args: [user.address, sell],
  });

  // Reset on user change
  useEffect(() => {
    setBuy(0);
    setSell(0);
  }, [user]);

  return (
    <Card title="Buy/Sell">
      <div className="h-full p-4">
        {!isConnected ? (
          // Not connected state
          <div className="flex flex-col items-center justify-center h-full border border-dashed rounded-md">
            <ButtonIcon className="w-12 h-12 text-zinc-500" />
            <span className="text-zinc-500">Connect wallet to trade</span>
            <div className="mt-4">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-3">
            <div>
              <span className="flex break-word text-sm items-center">
                You own {Number(ownedAmount ?? 0)} share(s) of{" "}
                <span className="pl-2">
                  <Address
                    address={user.address}
                    username={user.username}
                    image={user.image}
                  />
                </span>
                .
              </span>
            </div>

            {/* Buy shares */}
            <Card title="Buy shares">
              <div className="p-2">
                <Input value={buy} disabled />

                <div className="flex [&>button]:flex-1 gap-3 mt-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (buy > 0) setBuy((previous) => previous - 1);
                    }}
                    disabled={buy === 0}
                  >
                    -
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setBuy((previous) => previous + 1)}
                  >
                    +
                  </Button>
                </div>

                <Button
                  className="mt-2 w-full bg-buy hover:bg-buy hover:opacity-70"
                  onClick={() => executeBuy()}
                  disabled={buy === 0 || buyLoading}
                >
                  {buyLoading ? (
                    <div className="flex items-center">
                      <SymbolIcon className="h-4 w-4 animate-spin" />
                      <span className="pr-2">Executing buy...</span>
                    </div>
                  ) : (
                    <span>
                      Buy {buy} share(s){" "}
                      {buyPrice
                        ? `for ${
                            currency === Currency.ETH
                              ? `${(Number(buyPrice) / 1e18).toFixed(6)} Ξ`
                              : `$${parseUSD((Number(buyPrice) / 1e18) * eth)}`
                          }`
                        : ""}
                    </span>
                  )}
                </Button>
              </div>
            </Card>

            {/* Sell shares */}
            <Card title="Sell shares">
              <div className="p-2">
                <Input value={sell} disabled />

                <div className="flex [&>button]:flex-1 gap-3 mt-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (sell > 0) setSell((previous) => previous - 1);
                    }}
                    disabled={sell === 0}
                  >
                    -
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (sell < Number(ownedAmount ?? 0)) {
                        setSell((previous) => previous + 1);
                      }
                    }}
                    disabled={sell >= Number(ownedAmount ?? 0)}
                  >
                    +
                  </Button>
                </div>

                <Button
                  className="mt-2 w-full bg-sell hover:bg-sell hover:opacity-70"
                  onClick={() => executeSell()}
                  disabled={sell === 0 || sellLoading}
                >
                  {sellLoading ? (
                    <div className="flex items-center">
                      <SymbolIcon className="h-4 w-4 animate-spin" />
                      <span className="pr-2">Executing sell...</span>
                    </div>
                  ) : (
                    <span>
                      Sell {sell} share(s){" "}
                      {sellPrice
                        ? `for ${
                            currency === Currency.ETH
                              ? `${(Number(sellPrice) / 1e18).toFixed(6)} Ξ`
                              : `$${parseUSD((Number(sellPrice) / 1e18) * eth)}`
                          }`
                        : ""}
                    </span>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
}
