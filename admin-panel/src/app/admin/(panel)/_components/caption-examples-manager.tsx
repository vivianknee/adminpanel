"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import DataTable, { type Column } from "./data-table";
import ConfirmDialog from "./confirm-dialog";
import FormModal, { type FieldConfig } from "./form-modal";

type CaptionExampleRow = {
  id: number;
  created_datetime_utc?: string;
  image_description?: string;
  caption?: string;
  explanation?: string;
  image_id?: number;
  [key: string]: unknown;
};

const FIELDS: FieldConfig[] = [
  {
    key: "image_id",
    label: "Image ID",
    type: "number",
    required: true,
    placeholder: "Image ID",
  },
  {
    key: "image_description",
    label: "Image Description",
    type: "textarea",
    required: true,
    placeholder: "Description of the image...",
  },
  {
    key: "caption",
    label: "Caption",
    type: "textarea",
    required: true,
    placeholder: "The example caption...",
  },
  {
    key: "explanation",
    label: "Explanation",
    type: "textarea",
    placeholder: "Why this caption works...",
  },
];

export default function CaptionExamplesManager({
  initialData,
  totalCount,
  pageSize,
}: {
  initialData: CaptionExampleRow[];
  totalCount: number;
  pageSize: number;
}) {
  const [data, setData] = useState<CaptionExampleRow[]>(initialData);
  const [count, setCount] = useState(totalCount);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CaptionExampleRow | null>(null);
  const [deletingItem, setDeletingItem] = useState<CaptionExampleRow | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchData = async (p: number, q: string) => {
    setLoading(true);
    const supabase = createClient();
    const from = p * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("caption_examples")
      .select("*", { count: "exact" })
      .order("id", { ascending: false })
      .range(from, to);

    if (q) {
      query = query.or(
        `caption.ilike.%${q}%,image_description.ilike.%${q}%`
      );
    }

    const { data: rows, count: total } = await query;
    setData(rows ?? []);
    setCount(total ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    if (page === 0 && !search) return;
    fetchData(page, search);
  }, [page]);

  useEffect(() => {
    setPage(0);
    fetchData(0, search);
  }, [search]);

  const handleCreate = async (formData: Record<string, unknown>) => {
    const supabase = createClient();
    const { error } = await supabase.from("caption_examples").insert({
      image_id: formData.image_id,
      image_description: formData.image_description,
      caption: formData.caption,
      explanation: formData.explanation || null,
    });
    if (error) throw new Error(error.message);
    showMessage("Caption example created successfully.", "success");
    fetchData(page, search);
  };

  const handleUpdate = async (formData: Record<string, unknown>) => {
    if (!editingItem) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("caption_examples")
      .update({
        image_id: formData.image_id,
        image_description: formData.image_description,
        caption: formData.caption,
        explanation: formData.explanation || null,
      })
      .eq("id", editingItem.id);
    if (error) throw new Error(error.message);
    showMessage("Caption example updated successfully.", "success");
    setEditingItem(null);
    fetchData(page, search);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("caption_examples")
      .delete()
      .eq("id", deletingItem.id);
    if (error) {
      showMessage(`Delete failed: ${error.message}`, "error");
    } else {
      showMessage("Caption example deleted.", "success");
      fetchData(page, search);
    }
    setDeletingItem(null);
  };

  const columns: Column<CaptionExampleRow>[] = [
    {
      key: "id",
      header: "ID",
      render: (row) => (
        <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
          {row.id}
        </span>
      ),
    },
    {
      key: "image_id",
      header: "Image ID",
      render: (row) => (
        <span className="text-sm">{row.image_id ?? "—"}</span>
      ),
    },
    {
      key: "image_description",
      header: "Image Desc",
      render: (row) => (
        <span
          className="text-xs truncate block max-w-[200px]"
          style={{ color: row.image_description ? "var(--foreground)" : "var(--muted)" }}
        >
          {row.image_description || "—"}
        </span>
      ),
    },
    {
      key: "caption",
      header: "Caption",
      render: (row) => (
        <span
          className="text-xs truncate block max-w-[200px]"
          style={{ color: row.caption ? "var(--foreground)" : "var(--muted)" }}
        >
          {row.caption || "—"}
        </span>
      ),
    },
    {
      key: "explanation",
      header: "Explanation",
      render: (row) => (
        <span
          className="text-xs truncate block max-w-[200px]"
          style={{ color: row.explanation ? "var(--foreground)" : "var(--muted)" }}
        >
          {row.explanation || "—"}
        </span>
      ),
    },
    {
      key: "created",
      header: "Created",
      render: (row) => (
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {row.created_datetime_utc
            ? new Date(row.created_datetime_utc).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
  ];

  return (
    <>
      {message && (
        <div
          className="rounded-lg px-4 py-2.5 text-sm mb-4"
          style={{
            background:
              message.type === "success"
                ? "var(--vote-up-hover-bg)"
                : "var(--vote-down-hover-bg)",
            color:
              message.type === "success"
                ? "var(--vote-up-hover-text)"
                : "var(--vote-down-hover-text)",
          }}
        >
          {message.text}
        </div>
      )}

      <DataTable<CaptionExampleRow>
        columns={columns}
        data={data}
        totalCount={count}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by caption or description..."
        isLoading={loading}
        headerActions={
          <button
            onClick={() => {
              setEditingItem(null);
              setFormOpen(true);
            }}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
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
            Add Example
          </button>
        }
        actions={(row) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => {
                setEditingItem(row);
                setFormOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
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
              Edit
            </button>
            <button
              onClick={() => setDeletingItem(row)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              style={{ background: "#dc2626", color: "#fff" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#b91c1c")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#dc2626")
              }
            >
              Delete
            </button>
          </div>
        )}
      />

      <FormModal
        isOpen={formOpen}
        title={editingItem ? "Edit Caption Example" : "Add Caption Example"}
        fields={FIELDS}
        initialValues={editingItem ?? {}}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        onSave={editingItem ? handleUpdate : handleCreate}
      />

      <ConfirmDialog
        isOpen={deletingItem !== null}
        title="Delete Caption Example"
        message={`Are you sure you want to delete caption example #${deletingItem?.id}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </>
  );
}
