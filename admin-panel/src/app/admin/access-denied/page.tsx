"use client";

import { useRouter } from "next/navigation";

export default function AccessDenied() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--background)" }}
    >
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center shadow-lg"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--vote-down-hover-bg)" }}
        >
          <span className="text-2xl" style={{ color: "var(--error-text)" }}>
            !
          </span>
        </div>
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--foreground)" }}
        >
          Access Denied
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          You do not have superadmin privileges. Contact an administrator if you
          believe this is an error.
        </p>
        <button
          onClick={() => router.push("/protected")}
          className="px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
          style={{ background: "var(--accent)", color: "var(--accent-text)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--accent-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--accent)")
          }
        >
          Go to App
        </button>
      </div>
    </div>
  );
}
