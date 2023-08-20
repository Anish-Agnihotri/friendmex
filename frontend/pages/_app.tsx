import { Global } from "state/global";
import type { AppProps } from "next/app";

// CSS imports
import "global.css";
import "react-resizable/css/styles.css";
import "react-grid-layout/css/styles.css";
import "@rainbow-me/rainbowkit/styles.css";

// RainbowKit
import { base } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import {
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";

// Setup provider
const { chains, publicClient } = configureChains([base], [publicProvider()]);

// Setup connector
const { connectors } = getDefaultWallets({
  appName: "FriendMEX",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains,
});

// Setup Wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function FriendMEX({ Component, pageProps }: AppProps) {
  return (
    // Wrap in RainbowKit providers
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} theme={darkTheme()}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
