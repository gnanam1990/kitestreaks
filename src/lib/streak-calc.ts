export interface StreakInfo {
  current: number;
  longest: number;
  most_active_day: { date: string; count: number };
  total: number;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function calculateStreaks(
  daily_counts: Map<string, number>,
  today: Date = new Date()
): StreakInfo {
  let current = 0;
  const cursor = new Date(today);
  while (true) {
    if ((daily_counts.get(dayKey(cursor)) ?? 0) > 0) {
      current++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else break;
  }

  let longest = 0;
  let running = 0;
  let total = 0;
  let mostActive = { date: "", count: 0 };
  let prevActive: number | null = null;
  const DAY_MS = 24 * 60 * 60 * 1000;

  const sorted = [...daily_counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  for (const [date, count] of sorted) {
    total += count;
    if (count > mostActive.count) mostActive = { date, count };
    if (count > 0) {
      // The map only contains days with activity, so consecutive entries are
      // not necessarily consecutive calendar days. Only extend the run when
      // this active day directly follows the previous one.
      const day = Date.parse(`${date}T00:00:00Z`);
      running = prevActive !== null && day - prevActive === DAY_MS ? running + 1 : 1;
      if (running > longest) longest = running;
      prevActive = day;
    } else {
      running = 0;
      prevActive = null;
    }
  }

  return { current, longest, most_active_day: mostActive, total };
}
