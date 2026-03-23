"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import DataTable, { type Column } from "./data-table";
import ConfirmDialog from "./confirm-dialog";
import FormModal, { type FieldConfig } from "./form-modal";

type WhitelistEmailRow = {
  id: number;
  created_datetime_utc?: string;
  email_address?: string;
  [key: string]: unknown;
};

const FIELDS: FieldConfig[] = [
  {
    key: "email_address",
    label: "Email Address",
    type: "text",
    required: true,
    placeholder: "user@example.com",
  },
];

export default function WhitelistEmailsManager({
  initialData,
  totalCount,
  pageSize,
}: {
  initialData: WhitelistEmailRow[];
  totalCount: number;
  pageSize: number;
}) {
  const [data, setData] = useState<WhitelistEmailRow[]>(initialData);
  const [count, setCount] = useState(totalCount);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WhitelistEmailRow | null>(null);
  const [deletingItem, setDeletingItem] = useState<WhitelistEmailRow | null>(null);
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
      .from("whitelist_email_addresses")
      .select("*", { count: "exact" })
      .order("id", { ascending: false })
      .range(from, to);

    if (q) {
      query = query.ilike("email_address", `%${q}%`);
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
    const { error } = await supabase.from("whitelist_email_addresses").insert({
      email_address: formData.email_address,
      created_by_user_id: user!.id,
      modified_by_user_id: user!.id,
    });
    if (error) throw new Error(error.message);
    showMessage("Email added to whitelist.", "success");
    fetchData(page, search);
  };

  const handleUpdate = async (formData: Record<string, unknown>) => {
    if (!editingItem) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("whitelist_email_addresses")
      .update({
        email_address: formData.email_address,
        modified_by_user_id: user!.id,
      })
      .eq("id", editingItem.id);
    if (error) throw new Error(error.message);
    showMessage("Email updated successfully.", "success");
    setEditingItem(null);
    fetchData(page, search);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("whitelist_email_addresses")
      .delete()
      .eq("id", deletingItem.id);
    if (error) {
      showMessage(`Delete failed: ${error.message}`, "error");
    } else {
      showMessage("Email removed from whitelist.", "success");
      fetchData(page, search);
    }
    setDeletingItem(null);
  };

  const columns: Column<WhitelistEmailRow>[] = [
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
      key: "email_address",
      header: "Email Address",
      render: (row) => (
        <span className="text-sm">{row.email_address ?? "—"}</span>
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

      <DataTable<WhitelistEmailRow>
        columns={columns}
        data={data}
        totalCount={count}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search emails..."
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
            Add Email
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
        title={editingItem ? "Edit Email" : "Add Email"}
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
        title="Delete Email"
        message={`Are you sure you want to remove "${deletingItem?.email_address}" from the whitelist?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </>
  );
}
