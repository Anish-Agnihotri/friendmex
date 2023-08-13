import axios from "axios";
import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";

// Global state user
export type StateUser = {
  address: string;
  username?: string | null;
  image?: string | null;
};

export enum Currency {
  USD,
  ETH,
}

function useGlobal() {
  // Default: @cobie
  const [user, setUser] = useState<StateUser>({
    address: "0x4e5f7e4a774bd30b9bdca7eb84ce3681a71676e1",
    username: "cobie",
    image:
      "https://pbs.twimg.com/profile_images/1688496375707701248/WwWz33DI.jpg",
  });

  // Currency
  const [currency, setCurrency] = useState<Currency>(Currency.ETH);

  // ETH Price
  const [eth, setEth] = useState<number>(0);

  // Load eth price on page load
  useEffect(() => {
    async function collectEthPrice() {
      const { data } = await axios.get("/api/eth");
      setEth(data);
    }

    collectEthPrice();
  }, []);

  return { eth, user, setUser, currency, setCurrency };
}

export const Global = createContainer(useGlobal);
