"use client";

import { useTheme } from "../theme-provider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
      style={{
        background: "var(--btn-bg)",
        color: "var(--btn-text)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--btn-bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--btn-bg)")}
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
