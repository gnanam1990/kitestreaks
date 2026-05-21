interface Props {
  daily_counts: Map<string, number>;
}

function colorFor(count: number): string {
  if (count === 0) return "#F1EBE0";
  if (count <= 2) return "#E3D7C2";
  if (count <= 5) return "#B29D7D";
  if (count <= 10) return "#9B8564";
  return "#485C11";
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function Heatmap({ daily_counts }: Props) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setUTCDate(today.getUTCDate() - 364);
  // align start to a Sunday-like grid: shift back to the previous Sunday so columns are full weeks
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const totalDays = Math.floor((today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const weeks = Math.ceil((totalDays + 6) / 7);

  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;

  const cells: { row: number; col: number; date: string; count: number }[] = [];
  const cursor = new Date(start);
  for (let col = 0; col < weeks; col++) {
    for (let row = 0; row < 7; row++) {
      if (cursor > today) break;
      const date = cursor.toISOString().slice(0, 10);
      cells.push({ row, col, date, count: daily_counts.get(date) ?? 0 });
      if (row === 0 && cursor.getUTCMonth() !== lastMonth) {
        monthLabels.push({ col, label: MONTHS[cursor.getUTCMonth()] });
        lastMonth = cursor.getUTCMonth();
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  const cellSize = 12;
  const gap = 3;
  const xPad = 30;
  const yPad = 18;
  const width = xPad + weeks * (cellSize + gap);
  const height = yPad + 7 * (cellSize + gap);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto block"
        role="img"
        aria-label="Kite activity heatmap"
      >
        {monthLabels.map((m) => (
          <text
            key={m.col}
            x={xPad + m.col * (cellSize + gap)}
            y={yPad - 6}
            fontSize="9"
            fill="#9B8564"
          >
            {m.label}
          </text>
        ))}
        {["Mon", "Wed", "Fri"].map((label, i) => (
          <text
            key={label}
            x={0}
            y={yPad + (i * 2 + 1) * (cellSize + gap) + cellSize - 2}
            fontSize="9"
            fill="#9B8564"
          >
            {label}
          </text>
        ))}
        {cells.map((c, i) => (
          <rect
            key={i}
            x={xPad + c.col * (cellSize + gap)}
            y={yPad + c.row * (cellSize + gap)}
            width={cellSize}
            height={cellSize}
            rx={2}
            fill={colorFor(c.count)}
          >
            <title>
              {c.date}: {c.count} tx{c.count === 1 ? "" : "s"}
            </title>
          </rect>
        ))}
      </svg>
    </div>
  );
}

export function HeatmapLegend() {
  const stops = [0, 1, 3, 6, 11];
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-kite-fg/55">
      <span>Less</span>
      {stops.map((s) => (
        <span
          key={s}
          className="inline-block w-3 h-3 rounded-[2px]"
          style={{ background: colorFor(s) }}
        />
      ))}
      <span>More</span>
    </div>
  );
}
