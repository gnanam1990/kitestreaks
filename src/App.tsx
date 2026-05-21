import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import { Heatmap, HeatmapLegend } from "./components/heatmap";
import { StreakStats } from "./components/streak-stats";
import { PreviewBadge } from "./components/preview-badge";
import { getYearlyActivity } from "./lib/heatmap-data";
import { calculateStreaks, type StreakInfo } from "./lib/streak-calc";

const SAMPLE = "0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043";

export default function App() {
  const [address, setAddress] = useState<string>(() => {
    const fromUrl = window.location.pathname.match(/^\/(0x[a-fA-F0-9]{40})/)?.[1];
    return fromUrl ?? SAMPLE;
  });
  const [daily, setDaily] = useState<Map<string, number>>(new Map());
  const [info, setInfo] = useState<StreakInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getYearlyActivity(address)
      .then((d) => {
        setDaily(d);
        setInfo(calculateStreaks(d));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
    window.history.replaceState(null, "", `/${address}`);
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

        {loading && (
          <div className="rounded-xl border border-kite-border bg-kite-card p-6 text-sm font-mono text-kite-fg/60">
            Loading transactions from KiteScan…
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-kite-destructive/40 bg-kite-destructive/5 p-6 text-sm font-mono text-kite-destructive">
            {error}
          </div>
        )}
        {!loading && !error && info && (
          <div className="space-y-6">
            <div className="rounded-xl border border-kite-border bg-kite-card p-4 sm:p-6">
              <Heatmap daily_counts={daily} />
              <div className="mt-4 flex items-center justify-between">
                <HeatmapLegend />
                <PreviewBadge>Daily granularity</PreviewBadge>
              </div>
            </div>
            <StreakStats info={info} />
            <div className="rounded-xl border border-kite-border bg-kite-muted p-5 text-sm text-kite-fg/75">
              <p className="font-semibold text-kite-fg mb-1">Honest scope</p>
              <p>
                Data is pulled client-side from KiteScan on page load — not live. Cross-chain
                activity, hourly granularity, and real-time updates are <PreviewBadge>v0.2</PreviewBadge>.
              </p>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
