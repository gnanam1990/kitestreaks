# KiteStreaks

> GitHub-style activity heatmaps for any Kite Mainnet address — daily transaction counts, streaks, and totals over the last 12 months.

![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6)

## Overview

KiteStreaks renders a contribution-style heatmap for a Kite Mainnet wallet, showing how active it has been day-by-day over the past year. It is a fully client-side single-page app: it reads public on-chain activity directly from the KiteScan explorer (a Blockscout v2 API) in the browser, with no backend of its own. Useful for visualizing wallet or agent activity, tracking engagement streaks, and sharing a quick at-a-glance view of an address.

## Features

- Year-long activity heatmap (52 weeks) built from on-chain transactions, rendered as inline SVG with a warm Kite palette.
- Streak metrics computed from daily activity: current streak, longest streak, total transactions, and most-active day.
- Address routing via the URL path — open `/<0x-address>` to load that wallet directly; URL updates as you search.
- Progressive loading: paginates the KiteScan API up to a page/time budget, updating the heatmap as more data arrives.
- Client-side caching in `localStorage` (15-minute TTL) so revisited addresses render instantly.
- Quick links out to the address on KiteScan and AgentID.
- A built-in sample address renders demo data when the explorer returns nothing for it.

## Tech stack

- Vite 6 (build tooling / dev server)
- React 19 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- lucide-react (icons)
- Data source: KiteScan explorer Blockscout v2 REST API (`https://kitescan.ai/api/v2`)

## Getting started

### Prerequisites

- Node.js 18+ (Vite 6 requires Node 18 or newer)
- npm (a `package-lock.json` is committed)

### Installation

```bash
npm install
```

### Configuration

No environment variables are required. The KiteScan API base URL is hardcoded in `src/lib/kitescan-api.ts`, and there is no `.env` file or runtime config to set.

### Running

```bash
npm run dev       # start the dev server on http://localhost:3000
npm run build     # production build to dist/
npm run preview   # preview the production build locally
npm run lint      # type-check with tsc --noEmit
```

## Usage

With the dev server running, open the app and search for a Kite Mainnet address, or navigate directly to a path-based route:

```
http://localhost:3000/0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043
```

The app fetches that address's transactions from KiteScan, buckets them by UTC day, and renders the heatmap plus streak stats. Results are cached in the browser for 15 minutes.

## Project structure

```
src/
  App.tsx               app shell, address routing, fetch + cache orchestration
  main.tsx              React entry point
  index.css             Tailwind + theme tokens
  components/           heatmap, streak stats, header/footer, logo, badges
  lib/
    kitescan-api.ts     KiteScan Blockscout v2 client (transactions endpoint)
    heatmap-data.ts     paginated yearly-activity aggregation into daily counts
    streak-calc.ts      current/longest streak, total, and most-active-day
public/brand/           Kite logo assets
```

## How streaks are computed

`src/lib/streak-calc.ts` derives metrics from a map of `day -> transaction count`:

- Current streak: walks back from today counting consecutive days with at least one transaction.
- Longest streak: scans the full window, extending a run only when active days are calendar-adjacent.
- Total and most-active day: summed and tracked across the window.

`src/lib/heatmap-data.ts` builds that map by paging the KiteScan transactions endpoint (default up to 8 pages or a ~10s time budget), stopping once it reaches transactions older than 12 months.

## Status

Working preview, deployable as a static site. The heatmap, streak metrics, address routing, and KiteScan integration are implemented and functional.

Known limits and preview scope:

- Daily granularity only — no hourly buckets.
- No cross-chain aggregation — Kite Mainnet only.
- Activity is fetched on load and cached client-side; there are no live/real-time updates.
- Coverage is bounded by the page/time budget when scanning the explorer, so very high-volume addresses may be partially scanned.
- No automated tests and no CI workflow are present in the repo.

## License

MIT — see [LICENSE](LICENSE).
