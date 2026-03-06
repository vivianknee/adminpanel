"use client";

import { createClient } from "./utils/supabase/client";
import { useTheme } from "./theme-provider";

export default function Home() {
  const { theme, toggle } = useTheme();

  const handleSignIn = () => {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center transition-colors"
      style={{ background: "var(--background)" }}
    >
      <button
        onClick={toggle}
        className="absolute top-6 right-6 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        style={{
          background: "var(--btn-bg)",
          color: "var(--btn-text)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--btn-bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--btn-bg)")}
      >
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>

      <div className="text-center">
        <h1
          className="text-5xl font-bold mb-3 tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Crackd Captions
        </h1>
        <p className="mb-8" style={{ color: "var(--muted)" }}>
          Sign in to upload images and generate captions
        </p>
        <button
          onClick={handleSignIn}
          className="font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer shadow-lg"
          style={{ background: "var(--accent)", color: "var(--accent-text)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
