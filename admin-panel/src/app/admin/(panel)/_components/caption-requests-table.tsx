"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import DataTable, { type Column } from "./data-table";

type CaptionRequestRow = {
  id: number;
  created_datetime_utc?: string;
  profile_id?: string;
  image_id?: number;
  [key: string]: unknown;
};

export default function CaptionRequestsTable({
  initialData,
  totalCount,
  pageSize,
}: {
  initialData: CaptionRequestRow[];
  totalCount: number;
  pageSize: number;
}) {
  const [data, setData] = useState<CaptionRequestRow[]>(initialData);
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
      .from("caption_requests")
      .select("*", { count: "exact" })
      .order("id", { ascending: false })
      .range(from, to);

    if (q) {
      query = query.ilike("profile_id", `%${q}%`);
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

  const columns: Column<CaptionRequestRow>[] = [
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
      key: "profile_id",
      header: "Profile ID",
      render: (row) => (
        <span
          className="text-xs font-mono"
          style={{ color: "var(--muted)" }}
          title={row.profile_id}
        >
          {row.profile_id ? row.profile_id.slice(0, 8) + "..." : "—"}
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
    <DataTable<CaptionRequestRow>
      columns={columns}
      data={data}
      totalCount={count}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by profile ID..."
      isLoading={loading}
    />
  );
}
