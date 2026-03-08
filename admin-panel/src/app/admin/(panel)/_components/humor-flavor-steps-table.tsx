"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import DataTable, { type Column } from "./data-table";

type HumorFlavorStepRow = {
  id: number;
  created_datetime_utc?: string;
  humor_flavor_id?: number;
  llm_temperature?: number;
  order_by?: number;
  llm_input_type_id?: number;
  llm_output_type_id?: number;
  llm_model_id?: number;
  humor_flavor_step_type_id?: number;
  llm_system_prompt?: string;
  llm_user_prompt?: string;
  description?: string;
  [key: string]: unknown;
};

export default function HumorFlavorStepsTable({
  initialData,
  totalCount,
  pageSize,
}: {
  initialData: HumorFlavorStepRow[];
  totalCount: number;
  pageSize: number;
}) {
  const [data, setData] = useState<HumorFlavorStepRow[]>(initialData);
  const [count, setCount] = useState(totalCount);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchData = async (p: number, q: string) => {
    setLoading(true);
    const supabase = createClient();
    const from = p * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("humor_flavor_steps")
      .select("*", { count: "exact" })
      .order("id", { ascending: false })
      .range(from, to);

    if (q) {
      query = query.ilike("description", `%${q}%`);
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

  const columns: Column<HumorFlavorStepRow>[] = [
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
      header: "Flavor ID",
      render: (row) => (
        <span className="text-sm">{row.humor_flavor_id ?? "—"}</span>
      ),
    },
    {
      key: "order_by",
      header: "Order",
      render: (row) => (
        <span className="text-sm">{row.order_by ?? "—"}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (row) => {
        const text = row.description || "—";
        const isExpanded = expandedId === row.id;
        const isLong = text.length > 80;
        return (
          <span
            className="text-sm block max-w-md cursor-pointer"
            style={{ color: row.description ? "var(--foreground)" : "var(--muted)" }}
            onClick={() => isLong && setExpandedId(isExpanded ? null : row.id)}
          >
            {isLong && !isExpanded ? text.slice(0, 80) + "..." : text}
          </span>
        );
      },
    },
    {
      key: "llm_temperature",
      header: "Temp",
      render: (row) => (
        <span className="text-xs font-mono">{row.llm_temperature ?? "—"}</span>
      ),
    },
    {
      key: "llm_model_id",
      header: "Model ID",
      render: (row) => (
        <span className="text-xs">{row.llm_model_id ?? "—"}</span>
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
    <DataTable<HumorFlavorStepRow>
      columns={columns}
      data={data}
      totalCount={count}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by description..."
      isLoading={loading}
    />
  );
}
