# Frontend

[BitMEX](https://www.bitmex.com/app/trade/XBTUSD)-inspired frontend for [friend.tech](https://www.friend.tech/) trading.

## Run locally

```bash
# Populate env vars
cp .env.sample .env.local && vim .env.local

# Install dependencies
pnpm install

# Run
pnpm run dev
```

## Bugs

1. Technically SSR'ing a date is non-optimal, but I'm lazy
