"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/captions", label: "Captions" },
];

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

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: isActive ? "var(--accent)" : "transparent",
                color: isActive ? "var(--accent-text)" : "var(--foreground)",
              }}
            >
              {item.label}
            </Link>
          );
        })}
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
