"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client";

const API_BASE = "https://api.almostcrackd.ai";
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/heic";

type Step = "idle" | "preparing" | "uploading" | "processing" | "generating" | "done";

const STEP_LABELS: Record<Step, string> = {
  idle: "",
  preparing: "Preparing upload…",
  uploading: "Uploading image…",
  processing: "Processing image…",
  generating: "Generating captions…",
  done: "Done!",
};

export default function ImageUpload() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [captions, setCaptions] = useState<string[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);
    setCaptions(null);
    setStep("idle");

    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  const getToken = async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Not authenticated");
    return session.access_token;
  };

  const handleGenerate = async () => {
    if (!file) return;
    setError(null);
    setCaptions(null);

    try {
      const token = await getToken();

      setStep("preparing");
      const presignedRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!presignedRes.ok) throw new Error("Failed to get upload URL");
      const { presignedUrl, cdnUrl } = await presignedRes.json();

      setStep("uploading");
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload image");

      setStep("processing");
      const registerRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
      });
      if (!registerRes.ok) throw new Error("Failed to register image");
      const { imageId } = await registerRes.json();

      setStep("generating");
      const captionRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId }),
      });
      if (!captionRes.ok) throw new Error("Failed to generate captions");
      const captionData = await captionRes.json();

      const raw: unknown[] = Array.isArray(captionData)
        ? captionData
        : captionData.captions ?? [captionData.caption ?? captionData];
      const generated: string[] = raw.map((item) =>
        typeof item === "string" ? item : (item as { content?: string }).content ?? JSON.stringify(item)
      );

      setCaptions(generated);
      setStep("done");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("idle");
    }
  };

  const isLoading = step !== "idle" && step !== "done";

  return (
    <div
      className="rounded-xl p-6 shadow-sm transition-colors"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
      }}
    >
      <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
        Upload Image
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-lg"
            style={{ background: "var(--subtle-bg)" }}
          />
        )}

        <div className="flex-1 space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleFileChange}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:cursor-pointer file:transition-colors"
            style={
              {
                color: "var(--muted)",
                "--file-bg": "var(--input-file-bg)",
                "--file-text": "var(--input-file-text)",
              } as React.CSSProperties
            }
          />

          <button
            onClick={handleGenerate}
            disabled={!file || isLoading}
            className="px-5 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "var(--accent)", color: "var(--accent-text)" }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) e.currentTarget.style.background = "var(--accent-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent)";
            }}
          >
            {isLoading ? STEP_LABELS[step] : "Generate Captions"}
          </button>

          {isLoading && (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{
                  borderColor: "var(--spinner-border)",
                  borderTopColor: "var(--spinner-top)",
                }}
              />
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {STEP_LABELS[step]}
              </span>
            </div>
          )}

          {error && (
            <p className="text-sm" style={{ color: "var(--error-text)" }}>
              {error}
            </p>
          )}
        </div>
      </div>

      {captions && captions.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            Generated Captions:
          </h3>
          <ul className="space-y-1">
            {captions.map((caption, i) => (
              <li
                key={i}
                className="text-sm rounded-lg px-3 py-2"
                style={{
                  color: "var(--foreground)",
                  background: "var(--subtle-bg)",
                }}
              >
                {caption}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
