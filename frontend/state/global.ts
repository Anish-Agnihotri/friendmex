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
  // Favorites
  const [favorites, setFavorites] = useState<Record<string, StateUser>>({});

  // On page load
  useEffect(() => {
    // Load eth price
    async function collectEthPrice() {
      const { data } = await axios.get("/api/eth");
      setEth(data);
    }
    collectEthPrice();

    // Load favorites from local storage
    const localFavorites = localStorage.getItem("friendmex_favorites");
    if (localFavorites) setFavorites(JSON.parse(localFavorites));
  }, []);

  // Update query params on user change
  useEffect(() => {
    // Shallow update url
    push(`/?address=${user.address}`, undefined, { shallow: true });
  }, [push, user.address]);

  /**
   * Track favorite user
   * @param {StateUser} user
   */
  const addFavorite = (user: StateUser) => {
    const newFavorites = { ...favorites, [user.address]: user };
    setFavorites(newFavorites);
    localStorage.setItem("friendmex_favorites", JSON.stringify(newFavorites));
  };

  /**
   * Remove favorite user
   * @param {StateUser} user
   */
  const removeFavorite = (user: StateUser) => {
    const { [user.address]: _, ...rest } = favorites;
    setFavorites(rest);
    localStorage.setItem("friendmex_favorites", JSON.stringify(rest));
  };

  /**
   * Toggles favorite user
   * @param {StateUser} user
   */
  const toggleFavorite = (user: StateUser) =>
    user.address in favorites ? removeFavorite(user) : addFavorite(user);

  return {
    eth,
    user,
    setUser,
    currency,
    setCurrency,
    favorites,
    toggleFavorite,
  };
}

export const Global = createContainer(useGlobal);
