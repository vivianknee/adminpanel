"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import DataTable, { type Column } from "./data-table";
import FormModal, { type FieldConfig } from "./form-modal";

type HumorMixRow = {
  id: number;
  created_datetime_utc?: string;
  humor_flavor_id?: number;
  caption_count?: number;
  [key: string]: unknown;
};

const MIX_FIELDS: FieldConfig[] = [
  {
    key: "humor_flavor_id",
    label: "Humor Flavor ID",
    type: "number",
    required: true,
    placeholder: "Humor flavor ID",
  },
  {
    key: "caption_count",
    label: "Caption Count",
    type: "number",
    required: true,
    placeholder: "Number of captions",
  },
];

export default function HumorMixManager({
  initialData,
  totalCount,
  pageSize,
}: {
  initialData: HumorMixRow[];
  totalCount: number;
  pageSize: number;
}) {
  const [data, setData] = useState<HumorMixRow[]>(initialData);
  const [count, setCount] = useState(totalCount);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HumorMixRow | null>(null);
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
      .from("humor_flavor_mix")
      .select("*", { count: "exact" })
      .order("id", { ascending: false })
      .range(from, to);

    if (q) {
      const num = Number(q);
      if (!isNaN(num)) {
        query = query.eq("humor_flavor_id", num);
      }
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

  const handleUpdate = async (formData: Record<string, unknown>) => {
    if (!editingItem) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("humor_flavor_mix")
      .update({
        humor_flavor_id: formData.humor_flavor_id,
        caption_count: formData.caption_count,
        modified_by_user_id: user!.id,
      })
      .eq("id", editingItem.id);
    if (error) throw new Error(error.message);
    showMessage("Humor mix updated successfully.", "success");
    setEditingItem(null);
    fetchData(page, search);
  };

  const columns: Column<HumorMixRow>[] = [
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
      key: "humor_flavor_id",
      header: "Humor Flavor ID",
      render: (row) => (
        <span className="text-sm">{row.humor_flavor_id ?? "—"}</span>
      ),
    },
    {
      key: "caption_count",
      header: "Caption Count",
      render: (row) => (
        <span className="text-sm font-mono">{row.caption_count ?? "—"}</span>
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

      <DataTable<HumorMixRow>
        columns={columns}
        data={data}
        totalCount={count}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by flavor ID..."
        isLoading={loading}
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
          </div>
        )}
      />

      <FormModal
        isOpen={formOpen}
        title="Edit Humor Mix"
        fields={MIX_FIELDS}
        initialValues={editingItem ?? {}}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        onSave={handleUpdate}
      />
    </>
  );
}
