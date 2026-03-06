"use client";

import { useState } from "react";
import { createClient } from "../utils/supabase/client";

type Caption = {
  id: number;
  content: string;
  like_count: number;
  images: { url: string } | { url: string }[] | null;
};

function getImageUrl(images: Caption["images"]): string | null {
  if (!images) return null;
  if (Array.isArray(images)) return images[0]?.url ?? null;
  return images.url ?? null;
}

export default function CaptionList({
  captions,
  userId,
  initialVotes,
}: {
  captions: Caption[];
  userId: string;
  initialVotes: { caption_id: number; vote_value: number }[];
}) {
  const supabase = createClient();
  const [voted, setVoted] = useState<Record<number, number | null>>(
    () => Object.fromEntries(initialVotes.map((v) => [v.caption_id, v.vote_value]))
  );
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>(
    () => Object.fromEntries(captions.map((c) => [c.id, c.like_count]))
  );
  const [message, setMessage] = useState<{ captionId: number; text: string; type: "success" | "error" } | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [captionIndex, setCaptionIndex] = useState(0);

  const handleVote = async (captionId: number, voteValue: number) => {
    const previousVote = voted[captionId] ?? null;
    if (previousVote === voteValue) return;

    const { error } = await supabase.from("caption_votes").upsert(
      {
        caption_id: captionId,
        profile_id: userId,
        vote_value: voteValue,
        created_datetime_utc: new Date().toISOString(),
      },
      { onConflict: "caption_id,profile_id" }
    );

    if (error) {
      setMessage({ captionId, text: `Vote failed: ${error.message}`, type: "error" });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setVoted((prev) => ({ ...prev, [captionId]: voteValue }));
      const delta = voteValue - (previousVote ?? 0);
      setLikeCounts((prev) => ({
        ...prev,
        [captionId]: prev[captionId] + delta,
      }));
      setMessage({ captionId, text: voteValue === 1 ? "Upvoted!" : "Downvoted!", type: "success" });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const grouped = new Map<string, Caption[]>();
  for (const caption of captions) {
    const url = getImageUrl(caption.images);
    if (!url) continue;
    const list = grouped.get(url);
    if (list) list.push(caption);
    else grouped.set(url, [caption]);
  }

  const activeCaptions = activeImage ? grouped.get(activeImage) ?? [] : [];
  const currentCaption = activeCaptions[captionIndex];

  return (
    <>
      {/* Image grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...grouped.entries()].map(([imageUrl, groupCaptions]) => (
          <li
            key={imageUrl}
            className="rounded-xl overflow-hidden shadow-sm transition-colors"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <img
              src={imageUrl}
              alt=""
              className="w-full aspect-square object-contain"
              style={{ background: "var(--subtle-bg)" }}
            />
            <div className="p-3 flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {groupCaptions.length} {groupCaptions.length === 1 ? "caption" : "captions"}
              </span>
              <button
                onClick={() => {
                  setActiveImage(imageUrl);
                  setCaptionIndex(0);
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-sm"
                style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
              >
                Vote on Captions
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Caption carousel modal */}
      {activeImage && currentCaption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="rounded-xl overflow-hidden w-full max-w-lg shadow-2xl transition-colors"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            {/* Close button */}
            <div className="flex justify-end p-3 pb-0">
              <button
                onClick={() => setActiveImage(null)}
                className="text-sm cursor-pointer transition-colors"
                style={{ color: "var(--close-text)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--close-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--close-text)")}
              >
                Close
              </button>
            </div>

            {/* Image */}
            <img
              src={activeImage}
              alt=""
              className="w-full aspect-square object-contain"
              style={{ background: "var(--subtle-bg)" }}
            />

            {/* Caption content */}
            <div className="p-4">
              {/* Counter */}
              <p className="text-xs mb-2" style={{ color: "var(--muted-2)" }}>
                {captionIndex + 1} / {activeCaptions.length}
              </p>

              <p
                className="text-sm leading-snug mb-3"
                style={{ color: "var(--foreground)" }}
              >
                {currentCaption.content}
              </p>

              {message?.captionId === currentCaption.id && (
                <p
                  className="text-xs mb-2"
                  style={{
                    color: message.type === "success" ? "var(--success-text)" : "var(--error-text)",
                  }}
                >
                  {message.text}
                </p>
              )}

              {/* Vote row */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {likeCounts[currentCaption.id]} likes
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVote(currentCaption.id, 1)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                    style={
                      voted[currentCaption.id] === 1
                        ? { background: "#22c55e", color: "#fff", transform: "scale(1.05)" }
                        : { background: "var(--vote-inactive-bg)", color: "var(--vote-inactive-text)" }
                    }
                    onMouseEnter={(e) => {
                      if (voted[currentCaption.id] !== 1) {
                        e.currentTarget.style.background = "var(--vote-up-hover-bg)";
                        e.currentTarget.style.color = "var(--vote-up-hover-text)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (voted[currentCaption.id] !== 1) {
                        e.currentTarget.style.background = "var(--vote-inactive-bg)";
                        e.currentTarget.style.color = "var(--vote-inactive-text)";
                      }
                    }}
                  >
                    Up
                  </button>
                  <button
                    onClick={() => handleVote(currentCaption.id, -1)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                    style={
                      voted[currentCaption.id] === -1
                        ? { background: "#ef4444", color: "#fff", transform: "scale(1.05)" }
                        : { background: "var(--vote-inactive-bg)", color: "var(--vote-inactive-text)" }
                    }
                    onMouseEnter={(e) => {
                      if (voted[currentCaption.id] !== -1) {
                        e.currentTarget.style.background = "var(--vote-down-hover-bg)";
                        e.currentTarget.style.color = "var(--vote-down-hover-text)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (voted[currentCaption.id] !== -1) {
                        e.currentTarget.style.background = "var(--vote-inactive-bg)";
                        e.currentTarget.style.color = "var(--vote-inactive-text)";
                      }
                    }}
                  >
                    Down
                  </button>
                </div>
              </div>

              {/* Back / Next navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCaptionIndex((i) => i - 1)}
                  disabled={captionIndex === 0}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "var(--btn-bg)", color: "var(--btn-text)" }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) e.currentTarget.style.background = "var(--btn-bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--btn-bg)";
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => setCaptionIndex((i) => i + 1)}
                  disabled={captionIndex === activeCaptions.length - 1}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "var(--btn-bg)", color: "var(--btn-text)" }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) e.currentTarget.style.background = "var(--btn-bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--btn-bg)";
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
