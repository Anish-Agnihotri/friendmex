import Indexer from "./indexer";

async function run() {
  // Environment variables
  const rpc_url: string | undefined = Bun.env.RPC_URL;
  if (!rpc_url) {
    throw new Error("Missing env vars");
  }

  const indexer = new Indexer(rpc_url);
  await indexer.sync();
}

try {
  await run();
} catch (e) {
  console.error(e);
  process.exit(1);
}
