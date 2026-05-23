# KiteStreaks

GitHub-style activity heatmap for any Kite Mainnet address. Tracks daily transaction counts, current/longest streaks, and the busiest day in the last 12 months.

## Deployment

- **Production:** https://kitestreaks.vercel.app
- **Host:** Vercel (`kitestreaks`)
- **Status:** production build verified; reads public KiteScan data client-side
- **Last verified:** 2026-05-23

## Stack

- Vite 6 + React 19 + TypeScript
- Tailwind v4 (warm Kite palette — never GitHub green)
- Custom SVG heatmap, no D3
- Data fetched client-side from `kitescan.ai/api/v2`

## Usage

```bash
pnpm install
pnpm dev   # http://localhost:3000
```

Open `/<address>` to see that address's heatmap. Example:

```
/0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043
```

## How the streak is computed

`src/lib/streak-calc.ts` walks back from today counting consecutive days with `>=1` tx for the *current* streak, then walks the full 12-month window for *longest* and totals.

## What's PREVIEW

- **Daily granularity only** — no hourly buckets in v0.1
- **Live updates** — data is fetched once on page load
- **Cross-chain aggregation** — Kite Mainnet only

## Roadmap

- v0.2: hourly heatmap, OG-image generation, embed `/embed/<address>.svg`
- v0.3: multi-address comparison, streak alerts

## License

MIT
