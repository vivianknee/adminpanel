"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/app/theme-provider";
import { createClient } from "@/app/utils/supabase/client";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/captions", label: "Captions" },
];

export default function AdminHeader({ email }: { email: string }) {
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 backdrop-blur-md px-6 py-3 flex items-center justify-between border-b transition-colors"
        style={{
          background: "var(--header-bg)",
          borderColor: "var(--header-border)",
        }}
      >
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden px-2 py-1 rounded-lg text-sm cursor-pointer transition-colors"
          style={{ background: "var(--btn-bg)", color: "var(--btn-text)" }}
        >
          Menu
        </button>

        <div className="hidden md:block" />

        <div className="flex items-center gap-3">
          <span
            className="text-sm hidden sm:inline"
            style={{ color: "var(--muted)" }}
          >
            {email}
          </span>
          <button
            onClick={toggle}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            style={{ background: "var(--btn-bg)", color: "var(--btn-text)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--btn-bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--btn-bg)")
            }
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            style={{ background: "var(--btn-bg)", color: "var(--btn-text)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--btn-bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--btn-bg)")
            }
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-64 h-full p-4 space-y-2"
            style={{ background: "var(--card-bg)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-lg font-bold"
                style={{ color: "var(--foreground)" }}
              >
                Crackd Admin
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-sm cursor-pointer"
                style={{ color: "var(--muted)" }}
              >
                Close
              </button>
            </div>
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: isActive ? "var(--accent)" : "transparent",
                    color: isActive
                      ? "var(--accent-text)"
                      : "var(--foreground)",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
            <div
              className="border-t pt-3 mt-4"
              style={{ borderColor: "var(--card-border)" }}
            >
              <Link
                href="/protected"
                className="block text-xs text-center"
                style={{ color: "var(--muted)" }}
              >
                Back to App
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
