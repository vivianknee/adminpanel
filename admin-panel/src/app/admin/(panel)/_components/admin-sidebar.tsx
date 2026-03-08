"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "./nav-config";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-60 shrink-0 border-r hidden md:flex flex-col transition-colors"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="p-5 border-b" style={{ borderColor: "var(--card-border)" }}>
        <Link href="/admin">
          <h1
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            Crackd Admin
          </h1>
        </Link>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
          Management Panel
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div
                className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--muted)" }}
              >
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: isActive ? "var(--accent)" : "transparent",
                      color: isActive ? "var(--accent-text)" : "var(--foreground)",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className="p-4 border-t"
        style={{ borderColor: "var(--card-border)" }}
      >
        <Link
          href="/protected"
          className="block text-xs text-center transition-colors"
          style={{ color: "var(--muted)" }}
        >
          Back to App
        </Link>
      </div>
    </aside>
  );
}
