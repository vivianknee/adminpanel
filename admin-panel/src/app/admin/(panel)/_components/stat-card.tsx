"use client";

import { type ReactNode } from "react";

export default function StatCard({
  title,
  value,
  subtitle,
  accent,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: "green" | "red" | "default";
  icon?: ReactNode;
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
      className="rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: colors.bg,
        border: accent ? "none" : "1px solid var(--card-border)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
          {title}
        </p>
        {icon && (
          <span style={{ color: accent ? colors.text : "var(--muted)" }} className="opacity-60">
            {icon}
          </span>
        )}
      </div>
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
