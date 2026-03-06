"use client";

export default function StatCard({
  title,
  value,
  subtitle,
  accent,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: "green" | "red" | "default";
}) {
  const accentColors: Record<string, { bg: string; text: string }> = {
    green: { bg: "var(--vote-up-hover-bg)", text: "var(--vote-up-hover-text)" },
    red: {
      bg: "var(--vote-down-hover-bg)",
      text: "var(--vote-down-hover-text)",
    },
    default: { bg: "var(--card-bg)", text: "var(--foreground)" },
  };

  const colors = accentColors[accent ?? "default"];

  return (
    <div
      className="rounded-xl p-5 transition-colors"
      style={{
        background: colors.bg,
        border: accent ? "none" : "1px solid var(--card-border)",
      }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>
        {title}
      </p>
      <p
        className="text-2xl font-bold tracking-tight"
        style={{ color: accent ? colors.text : "var(--foreground)" }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
