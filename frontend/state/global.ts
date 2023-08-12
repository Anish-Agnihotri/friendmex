import { useState } from "react";
import { createContainer } from "unstated-next";

function useGlobal() {
  // Default: @cobie
  const [address, setAddress] = useState<string>(
    "0x4e5f7e4a774bd30b9bdca7eb84ce3681a71676e1"
  );
  return { address, setAddress };
}

export const Global = createContainer(useGlobal);
