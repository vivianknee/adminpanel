"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import DataTable, { type Column } from "./data-table";

type Profile = {
  id: string;
  email?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_superadmin?: boolean;
  created_datetime_utc?: string;
  [key: string]: unknown;
};

export default function UsersTable({
  initialData,
  totalCount,
  pageSize,
}: {
  initialData: Profile[];
  totalCount: number;
  pageSize: number;
}) {
  const [data, setData] = useState<Profile[]>(initialData);
  const [count, setCount] = useState(totalCount);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async (p: number, q: string) => {
    setLoading(true);
    const supabase = createClient();
    const from = p * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("id", { ascending: true })
      .range(from, to);

    if (q) {
      query = query.or(
        `email.ilike.%${q}%,username.ilike.%${q}%,display_name.ilike.%${q}%`
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

  const columns: Column<Profile>[] = [
    {
      key: "id",
      header: "ID",
      render: (row) => (
        <span
          className="text-xs font-mono"
          style={{ color: "var(--muted)" }}
          title={row.id}
        >
          {row.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <span className="text-sm">{row.email ?? row.username ?? "—"}</span>
      ),
    },
    {
      key: "display_name",
      header: "Display Name",
      render: (row) => (
        <span className="text-sm" style={{ color: row.display_name ? "var(--foreground)" : "var(--muted)" }}>
          {row.display_name ?? "—"}
        </span>
      ),
    },
    {
      key: "is_superadmin",
      header: "Role",
      render: (row) =>
        row.is_superadmin ? (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: "var(--accent)",
              color: "var(--accent-text)",
            }}
          >
            Superadmin
          </span>
        ) : (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            User
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
    <DataTable<Profile>
      columns={columns}
      data={data}
      totalCount={count}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by email or name..."
      isLoading={loading}
    />
  );
}
