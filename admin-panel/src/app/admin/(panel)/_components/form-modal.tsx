"use client";

import { useState, useEffect, type ReactNode } from "react";

export type FieldConfig = {
  key: string;
  label: string;
  type: "text" | "url" | "number" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
};

export default function FormModal({
  isOpen,
  title,
  fields,
  initialValues,
  onClose,
  onSave,
  renderExtra,
}: {
  isOpen: boolean;
  title: string;
  fields: FieldConfig[];
  initialValues: Record<string, unknown>;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  renderExtra?: (values: Record<string, string>) => ReactNode;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      fields.forEach((f) => {
        initial[f.key] = initialValues[f.key] != null ? String(initialValues[f.key]) : "";
      });
      setValues(initial);
      setError("");
      setSaving(false);
    }
  }, [isOpen, initialValues, fields]);

  if (!isOpen) return null;

  const setValue = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const field of fields) {
      if (field.required && !values[field.key]?.trim()) {
        setError(`${field.label} is required.`);
        return;
      }
    }
    setSaving(true);
    setError("");
    try {
      const data: Record<string, unknown> = {};
      fields.forEach((f) => {
        const val = values[f.key]?.trim() ?? "";
        if (f.type === "number" && val !== "") {
          data[f.key] = Number(val);
        } else {
          data[f.key] = val;
        }
      });
      await onSave(data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: FieldConfig) => {
    const baseStyle = {
      background: "var(--subtle-bg)",
      border: "1px solid var(--card-border)",
      color: "var(--foreground)",
    };
    const baseClass =
      "w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors";

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            value={values[field.key] ?? ""}
            onChange={(e) => setValue(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`${baseClass} resize-none`}
            style={baseStyle}
          />
        );
      case "select":
        return (
          <select
            value={values[field.key] ?? ""}
            onChange={(e) => setValue(field.key, e.target.value)}
            className={`${baseClass} cursor-pointer`}
            style={baseStyle}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={field.type === "number" ? "number" : field.type}
            value={values[field.key] ?? ""}
            onChange={(e) => setValue(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={baseClass}
            style={baseStyle}
          />
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-xl w-full max-w-md p-6 shadow-2xl transition-colors max-h-[90vh] overflow-y-auto"
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
          {title}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--muted)" }}
              >
                {field.label}
                {field.required && " *"}
              </label>
              {renderField(field)}
            </div>
          ))}

          {renderExtra?.(values)}

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
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
