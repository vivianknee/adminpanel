"use client";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      onClick={onCancel}
    >
      <div
        className="rounded-xl w-full max-w-sm p-6 shadow-2xl transition-colors"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-lg font-bold mb-2"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </h3>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          {message}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={{ background: "var(--btn-bg)", color: "var(--btn-text)" }}
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
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={{ background: "#dc2626", color: "#fff" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#b91c1c")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#dc2626")
            }
          >
            {confirmLabel ?? "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
