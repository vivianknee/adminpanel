"use client";

type Segment = {
  label: string;
  value: number;
  color: string;
};

export default function DonutChart({
  segments,
  size = 160,
  strokeWidth = 28,
  title,
}: {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  title?: string;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-xs" style={{ color: "var(--muted)" }}>No data</span>
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativeOffset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const dashLength = pct * circumference;
    const dashOffset = -cumulativeOffset;
    cumulativeOffset += dashLength;
    return { ...seg, pct, dashLength, dashOffset };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      {title && (
        <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
          {title}
        </p>
      )}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--subtle-bg)"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc.dashLength} ${circumference - arc.dashLength}`}
              strokeDashoffset={arc.dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${center} ${center})`}
              className="transition-all duration-700"
              style={{ opacity: 0.85 }}
            />
          ))}
        </svg>
        {/* Center label */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <span className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
            {total}
          </span>
          <span className="text-[10px]" style={{ color: "var(--muted)" }}>
            total
          </span>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {arcs.map((arc, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: arc.color }}
            />
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              {arc.label}
            </span>
            <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
              {arc.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
