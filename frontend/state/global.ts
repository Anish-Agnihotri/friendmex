import { useState } from "react";
import { createContainer } from "unstated-next";

// Global state user
export type StateUser = {
  address: string;
  username?: string | null;
  image?: string | null;
};

function useGlobal() {
  // Default: @cobie
  const [user, setUser] = useState<StateUser>({
    address: "0x4e5f7e4a774bd30b9bdca7eb84ce3681a71676e1",
    username: "cobie",
    image:
      "https://pbs.twimg.com/profile_images/1688496375707701248/WwWz33DI.jpg",
  });

  return { user, setUser };
}

export const Global = createContainer(useGlobal);
