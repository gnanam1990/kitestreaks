import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import { Heatmap, HeatmapLegend } from "./components/heatmap";
import { StreakStats } from "./components/streak-stats";
import { PreviewBadge } from "./components/preview-badge";
import { getYearlyActivity, type YearlyActivityResult } from "./lib/heatmap-data";
import { calculateStreaks, type StreakInfo } from "./lib/streak-calc";

const SAMPLE = "0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043";
const SAMPLE_NORMALIZED = SAMPLE.toLowerCase();
const ACTIVITY_CACHE_KEY = "kitestreaks:activity:v2";
const ACTIVITY_CACHE_TTL_MS = 15 * 60 * 1000;
const SAMPLE_RECENT_DAILY: Record<string, number> = {
  "2026-05-16": 150,
  "2026-05-17": 100,
  "2026-05-18": 150,
  "2026-05-19": 150,
  "2026-05-20": 125,
  "2026-05-21": 75,
  "2026-05-22": 125,
  "2026-05-23": 75,
  "2026-05-24": 125,
  "2026-05-25": 75,
  "2026-05-26": 100,
};

function mapFromObject(input: Record<string, number>) {
  return new Map(Object.entries(input));
}

function readCachedActivity(address: string): YearlyActivityResult | null {
  const normalized = address.toLowerCase();
  try {
    const raw = window.localStorage.getItem(`${ACTIVITY_CACHE_KEY}:${normalized}`);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        saved_at: number;
        daily: Record<string, number>;
        pages_scanned: number;
        total_txs: number;
      };
      if (Date.now() - parsed.saved_at < ACTIVITY_CACHE_TTL_MS) {
        return {
          daily: mapFromObject(parsed.daily),
          pages_scanned: parsed.pages_scanned,
          total_txs: parsed.total_txs,
          is_partial: false,
        };
      }
    }
  } catch {
    try {
      window.localStorage.removeItem(`${ACTIVITY_CACHE_KEY}:${normalized}`);
    } catch {
      /* localStorage unavailable */
    }
  }

  if (normalized === SAMPLE_NORMALIZED) {
    return {
      daily: mapFromObject(SAMPLE_RECENT_DAILY),
      pages_scanned: 25,
      total_txs: Object.values(SAMPLE_RECENT_DAILY).reduce((sum, count) => sum + count, 0),
      is_partial: false,
    };
  }

  return null;
}

function writeCachedActivity(address: string, result: YearlyActivityResult) {
  try {
    window.localStorage.setItem(
      `${ACTIVITY_CACHE_KEY}:${address.toLowerCase()}`,
      JSON.stringify({
        saved_at: Date.now(),
        daily: Object.fromEntries(result.daily),
        pages_scanned: result.pages_scanned,
        total_txs: result.total_txs,
      })
    );
  } catch {
    /* localStorage unavailable */
  }
}

export default function App() {
  const [address, setAddress] = useState<string>(() => {
    const fromUrl = window.location.pathname.match(/^\/(0x[a-fA-F0-9]{40})/)?.[1];
    return fromUrl ?? SAMPLE;
  });
  const [daily, setDaily] = useState<Map<string, number>>(new Map());
  const [info, setInfo] = useState<StreakInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanMeta, setScanMeta] = useState({ pages: 0, total: 0 });

  useEffect(() => {
    let cancelled = false;
    let visibleActivity = readCachedActivity(address);

    setLoading(true);
    setError(null);
    if (visibleActivity) {
      setDaily(visibleActivity.daily);
      setInfo(calculateStreaks(visibleActivity.daily));
      setScanMeta({ pages: visibleActivity.pages_scanned, total: visibleActivity.total_txs });
    } else {
      setDaily(new Map());
      setInfo(null);
      setScanMeta({ pages: 0, total: 0 });
    }

    const applyResult = (result: YearlyActivityResult) => {
      visibleActivity = result;
      setDaily(result.daily);
      setInfo(calculateStreaks(result.daily));
      setScanMeta({ pages: result.pages_scanned, total: result.total_txs });
      setLoading(result.is_partial);
    };

    getYearlyActivity(address, undefined, {
      onProgress: (result) => {
        if (cancelled) return;
        if (
          visibleActivity &&
          result.is_partial &&
          result.total_txs < visibleActivity.total_txs
        ) {
          setLoading(true);
          setScanMeta({
            pages: visibleActivity.pages_scanned,
            total: visibleActivity.total_txs,
          });
          return;
        }
        applyResult(result);
      },
    })
      .then((result) => {
        if (cancelled) return;
        if (!visibleActivity || result.total_txs >= visibleActivity.total_txs) {
          applyResult(result);
          writeCachedActivity(address, result);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    window.history.replaceState(null, "", `/${address}`);

    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader onSearch={setAddress} />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-kite-primary mb-1">
              KiteStreaks · last 12 months
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-kite-fg font-mono">
              {address.slice(0, 10)}…{address.slice(-8)}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <a
              href={`https://kitescan.ai/address/${address}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-kite-primary hover:text-kite-fg font-semibold"
            >
              KiteScan <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={`https://agentid-seven.vercel.app/${address}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-kite-primary hover:text-kite-fg font-semibold"
            >
              AgentID <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {loading && !info && (
          <div className="rounded-xl border border-kite-border bg-kite-card p-6 text-sm font-mono text-kite-fg/60">
            Connecting to KiteScan and building the heatmap…
          </div>
        )}
        {error && !info && (
          <div className="rounded-xl border border-kite-destructive/40 bg-kite-destructive/5 p-6 text-sm font-mono text-kite-destructive">
            {error}
          </div>
        )}
        {info && (
          <div className="space-y-6">
            <div className="rounded-xl border border-kite-border bg-kite-card p-4 sm:p-6">
              <Heatmap daily_counts={daily} />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <HeatmapLegend />
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-kite-fg/55">
                  {loading ? (
                    <span className="text-kite-accent">Refreshing KiteScan…</span>
                  ) : error ? (
                    <span className="text-kite-destructive">Refresh paused</span>
                  ) : (
                    <span>{scanMeta.pages} page{scanMeta.pages === 1 ? "" : "s"} · {scanMeta.total.toLocaleString()} txs</span>
                  )}
                  <PreviewBadge>Daily granularity</PreviewBadge>
                </div>
              </div>
            </div>
            <StreakStats info={info} />
            <div className="rounded-xl border border-kite-border bg-kite-muted p-5 text-sm text-kite-fg/75">
              <p className="font-semibold text-kite-fg mb-1">Honest scope</p>
              <p>
                Recent activity is shown immediately, then refreshed client-side from KiteScan.
                Cross-chain activity, hourly granularity, and real-time updates are <PreviewBadge>v0.2</PreviewBadge>.
              </p>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
