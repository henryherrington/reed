function colorFor(count: number) {
  if (count <= 0) return "#efe9dc";
  if (count === 1) return "#c9ddc3";
  if (count === 2) return "#8fc084";
  if (count <= 4) return "#4f9142";
  return "#2c6b22";
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function Heatmap({ counts }: { counts: Record<string, number> }) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 364);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const days: Date[] = [];
  for (const cursor = new Date(start); cursor <= today; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    days.push(new Date(cursor));
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((d, di) => {
              const isFuture = d > today;
              const count = counts[dateKey(d)] || 0;
              return (
                <div
                  key={di}
                  title={isFuture ? undefined : `${count} rated on ${d.toLocaleDateString()}`}
                  className="w-[10px] h-[10px] rounded-[2px]"
                  style={{ background: isFuture ? "transparent" : colorFor(count) }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
