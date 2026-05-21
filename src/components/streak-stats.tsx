import { Activity, Calendar, Flame, Sparkles } from "lucide-react";
import type { StreakInfo } from "../lib/streak-calc";

export function StreakStats({ info }: { info: StreakInfo }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Stat
        icon={<Activity className="w-4 h-4" />}
        label="Total tx (12 mo)"
        value={info.total.toLocaleString()}
      />
      <Stat
        icon={<Flame className="w-4 h-4" />}
        label="Current streak"
        value={`${info.current} day${info.current === 1 ? "" : "s"}`}
        accent={info.current > 0}
      />
      <Stat
        icon={<Sparkles className="w-4 h-4" />}
        label="Longest streak"
        value={`${info.longest} day${info.longest === 1 ? "" : "s"}`}
      />
      <Stat
        icon={<Calendar className="w-4 h-4" />}
        label="Most active day"
        value={
          info.most_active_day.count > 0
            ? `${info.most_active_day.date} · ${info.most_active_day.count}`
            : "—"
        }
      />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-kite-border bg-kite-card p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-kite-fg/55">
        {icon} {label}
      </div>
      <div
        className={`mt-2 text-2xl font-mono font-bold ${
          accent ? "text-kite-accent" : "text-kite-fg"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
