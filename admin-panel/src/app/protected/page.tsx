import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";
import SignOutButton from "./sign-out-button";
import CaptionList from "./caption-list";
import ImageUpload from "./image-upload";
import ThemeToggle from "./theme-toggle";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: captions, error } = await supabase
    .from("captions")
    .select("id, content, like_count, images(url)")
    .order("id");

  const { data: votes } = await supabase
    .from("caption_votes")
    .select("caption_id, vote_value")
    .eq("profile_id", user.id);

  return (
    <div className="min-h-screen transition-colors" style={{ background: "var(--background)" }}>
      <header
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{
          background: "var(--header-bg)",
          borderBottom: "1px solid var(--header-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            Crackd Captions
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:inline" style={{ color: "var(--muted)" }}>
              {user.email}
            </span>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <ImageUpload />

        {error ? (
          <p style={{ color: "var(--error-text)" }}>Failed to load captions.</p>
        ) : (
          <CaptionList captions={captions ?? []} userId={user.id} initialVotes={votes ?? []} />
        )}
      </main>
    </div>
  );
}
