# Indexer

Indexes the [FriendtechSharesV1](https://basescan.org/address/0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4#code) contract on [Base](https://base.org/) for all `buyShares` or `sellShares` function calls.

Tracks:

- All users
- All trades
- Statistics including:
  - Top users by token supply
  - Newest users by first seen date
  - Recent trades
  - Leaderboard by realized profit

## Run locally

```bash
# Add env vars
cp .env.sample .env && vim .env

# Install dependencies
pnpm install

# Run locally
pnpm run build && pnpm run start
```
