"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import DataTable, { type Column } from "./data-table";

type HumorFlavorRow = {
  id: number;
  created_datetime_utc?: string;
  description?: string;
  slug?: string;
  [key: string]: unknown;
};

export default function HumorFlavorsTable({
  initialData,
  totalCount,
  pageSize,
}: {
  initialData: HumorFlavorRow[];
  totalCount: number;
  pageSize: number;
}) {
  const [data, setData] = useState<HumorFlavorRow[]>(initialData);
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
      .from("humor_flavors")
      .select("*", { count: "exact" })
      .order("id", { ascending: false })
      .range(from, to);

    if (q) {
      query = query.or(
        `slug.ilike.%${q}%,description.ilike.%${q}%`
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

  const columns: Column<HumorFlavorRow>[] = [
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
      key: "slug",
      header: "Slug",
      render: (row) => (
        <span className="text-sm font-mono">{row.slug ?? "—"}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (row) => (
        <span
          className="text-sm truncate block max-w-md"
          style={{ color: row.description ? "var(--foreground)" : "var(--muted)" }}
        >
          {row.description || "—"}
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
    <DataTable<HumorFlavorRow>
      columns={columns}
      data={data}
      totalCount={count}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by slug or description..."
      isLoading={loading}
    />
  );
}
