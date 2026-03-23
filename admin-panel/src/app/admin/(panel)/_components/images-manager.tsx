"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import DataTable, { type Column } from "./data-table";
import ConfirmDialog from "./confirm-dialog";
import FormModal, { type FieldConfig } from "./form-modal";

type ImageRow = {
  id: number;
  url: string;
  image_description?: string;
  created_datetime_utc?: string;
  [key: string]: unknown;
};

const IMAGE_FIELDS: FieldConfig[] = [
  {
    key: "url",
    label: "Image URL",
    type: "url",
    required: true,
    placeholder: "https://example.com/image.jpg",
  },
  {
    key: "image_description",
    label: "Description",
    type: "textarea",
    placeholder: "Describe what is in this image...",
  },
];

export default function ImagesManager({
  initialData,
  totalCount,
  pageSize,
}: {
  initialData: ImageRow[];
  totalCount: number;
  pageSize: number;
}) {
  const [data, setData] = useState<ImageRow[]>(initialData);
  const [count, setCount] = useState(totalCount);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageRow | null>(null);
  const [deletingImage, setDeletingImage] = useState<ImageRow | null>(null);
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
      .from("images")
      .select("*", { count: "exact" })
      .order("id", { ascending: false })
      .range(from, to);

    if (q) {
      query = query.or(
        `url.ilike.%${q}%,image_description.ilike.%${q}%`
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
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("images").insert({
      url: formData.url,
      image_description: formData.image_description || null,
      created_by_user_id: user!.id,
      modified_by_user_id: user!.id,
    });
    if (error) throw new Error(error.message);
    showMessage("Image created successfully.", "success");
    fetchData(page, search);
  };

  const handleUpdate = async (formData: Record<string, unknown>) => {
    if (!editingImage) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("images")
      .update({
        url: formData.url,
        image_description: formData.image_description || null,
        modified_by_user_id: user!.id,
      })
      .eq("id", editingImage.id);
    if (error) throw new Error(error.message);
    showMessage("Image updated successfully.", "success");
    setEditingImage(null);
    fetchData(page, search);
  };

  const handleDelete = async () => {
    if (!deletingImage) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("images")
      .delete()
      .eq("id", deletingImage.id);
    if (error) {
      showMessage(`Delete failed: ${error.message}`, "error");
    } else {
      showMessage("Image deleted.", "success");
      fetchData(page, search);
    }
    setDeletingImage(null);
  };

  const columns: Column<ImageRow>[] = [
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
      key: "thumbnail",
      header: "Image",
      render: (row) => (
        <img
          src={row.url}
          alt=""
          className="w-12 h-12 rounded-lg object-cover"
          style={{ background: "var(--subtle-bg)" }}
        />
      ),
    },
    {
      key: "url",
      header: "URL",
      render: (row) => (
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs hover:underline truncate block max-w-xs"
          style={{ color: "var(--accent)" }}
        >
          {row.url}
        </a>
      ),
    },
    {
      key: "image_description",
      header: "Description",
      render: (row) => (
        <span
          className="text-xs truncate block max-w-xs"
          style={{ color: row.image_description ? "var(--foreground)" : "var(--muted)" }}
        >
          {row.image_description || "—"}
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

      <DataTable<ImageRow>
        columns={columns}
        data={data}
        totalCount={count}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by URL or description..."
        isLoading={loading}
        exportFilename="images"
        exportColumns={[
          { header: "ID", value: (row) => String(row.id) },
          { header: "URL", value: (row) => row.url },
          { header: "Description", value: (row) => row.image_description ?? "" },
          { header: "Created", value: (row) => row.created_datetime_utc ?? "" },
        ]}
        selectable
        onBulkDelete={async (ids) => {
          const supabase = createClient();
          const { error } = await supabase
            .from("images")
            .delete()
            .in("id", ids);
          if (error) {
            showMessage(`Bulk delete failed: ${error.message}`, "error");
          } else {
            showMessage(`${ids.length} image(s) deleted.`, "success");
            fetchData(page, search);
          }
        }}
        headerActions={
          <button
            onClick={() => {
              setEditingImage(null);
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
            Add Image
          </button>
        }
        actions={(row) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => {
                setEditingImage(row);
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
              onClick={() => setDeletingImage(row)}
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
        title={editingImage ? "Edit Image" : "Add Image"}
        fields={IMAGE_FIELDS}
        initialValues={editingImage ?? {}}
        onClose={() => {
          setFormOpen(false);
          setEditingImage(null);
        }}
        onSave={editingImage ? handleUpdate : handleCreate}
        renderExtra={(values) =>
          values.url ? (
            <div
              className="rounded-lg overflow-hidden"
              style={{ background: "var(--subtle-bg)" }}
            >
              <img
                src={values.url}
                alt="Preview"
                className="w-full max-h-48 object-contain"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          ) : null
        }
      />

      <ConfirmDialog
        isOpen={deletingImage !== null}
        title="Delete Image"
        message={`Are you sure you want to delete image #${deletingImage?.id}? This action cannot be undone and will also remove any associated captions.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingImage(null)}
      />
    </>
  );
}
