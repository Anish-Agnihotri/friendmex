import axios from "axios";
import constants from "utils/constants";
import { useRouter } from "next/router";
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

function useGlobal(initialState: StateUser = constants.COBIE) {
  // Routing
  const { push } = useRouter();

  // Default: @cobie
  const [user, setUser] = useState<StateUser>(initialState);
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

  // Update query params on user change
  useEffect(() => {
    // Shallow update url
    push(`/?address=${user.address}`, undefined, { shallow: true });
  }, [push, user.address]);

  return { eth, user, setUser, currency, setCurrency };
}

export const Global = createContainer(useGlobal);
