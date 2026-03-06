"use client";

import { createClient } from "../utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
      style={{
        background: "var(--btn-bg)",
        color: "var(--btn-text)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--btn-bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--btn-bg)")}
    >
      Sign Out
    </button>
  );
}
