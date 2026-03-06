"use client";

import { useState, useEffect } from "react";

type ImageRow = {
  id: number;
  url: string;
  [key: string]: unknown;
};

export default function ImageFormModal({
  isOpen,
  image,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  image: ImageRow | null;
  onClose: () => void;
  onSave: (data: { url: string }) => Promise<void>;
}) {
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = image !== null;

  useEffect(() => {
    if (isOpen) {
      setUrl(image?.url ?? "");
      setError("");
      setSaving(false);
    }
  }, [isOpen, image]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("URL is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ url: url.trim() });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-xl w-full max-w-md p-6 shadow-2xl transition-colors"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: "var(--foreground)" }}
        >
          {isEditing ? "Edit Image" : "Add Image"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--muted)" }}
            >
              Image URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "var(--subtle-bg)",
                border: "1px solid var(--card-border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          {url && (
            <div
              className="rounded-lg overflow-hidden"
              style={{ background: "var(--subtle-bg)" }}
            >
              <img
                src={url}
                alt="Preview"
                className="w-full max-h-48 object-contain"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          )}

          {error && (
            <p className="text-xs" style={{ color: "var(--error-text)" }}>
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              style={{
                background: "var(--btn-bg)",
                color: "var(--btn-text)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--btn-bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--btn-bg)")
              }
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
              style={{
                background: "var(--accent)",
                color: "var(--accent-text)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--accent-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--accent)")
              }
            >
              {saving ? "Saving..." : isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
