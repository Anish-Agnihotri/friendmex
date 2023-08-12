import type { AppProps } from "next/app";

// CSS imports
import "globals.css";
import "react-resizable/css/styles.css";
import "react-grid-layout/css/styles.css";

export default function FriendMEX({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
