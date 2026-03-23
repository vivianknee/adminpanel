"use client";

type Bar = {
  label: string;
  value: number;
  color?: string;
};

export default function BarChart({
  bars,
  title,
  maxBars = 6,
}: {
  bars: Bar[];
  title?: string;
  maxBars?: number;
}) {
  const visible = bars.slice(0, maxBars);
  const maxValue = Math.max(...visible.map((b) => b.value), 1);

  if (visible.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-xs" style={{ color: "var(--muted)" }}>No data</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && (
        <p className="text-xs font-medium mb-3" style={{ color: "var(--muted)" }}>
          {title}
        </p>
      )}
      {visible.map((bar, i) => {
        const pct = (bar.value / maxValue) * 100;
        return (
          <div key={i} className="flex items-center gap-3">
            <span
              className="text-xs truncate shrink-0 text-right"
              style={{ color: "var(--foreground)", width: 80 }}
              title={bar.label}
            >
              {bar.label.length > 12 ? bar.label.slice(0, 12) + "..." : bar.label}
            </span>
            <div
              className="flex-1 h-6 rounded-md overflow-hidden"
              style={{ background: "var(--subtle-bg)" }}
            >
              <div
                className="h-full rounded-md transition-all duration-700"
                style={{
                  width: `${Math.max(pct, 2)}%`,
                  background: bar.color ?? "var(--accent)",
                  opacity: 0.85,
                }}
              />
            </div>
            <span
              className="text-xs font-medium shrink-0 w-8 text-right"
              style={{ color: "var(--foreground)" }}
            >
              {bar.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
