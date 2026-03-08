"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import DataTable, { type Column } from "./data-table";

type LlmResponseRow = {
  id: number;
  created_datetime_utc?: string;
  llm_model_response?: string;
  llm_model_id?: number;
  profile_id?: string;
  caption_request_id?: number;
  llm_system_prompt?: string;
  llm_user_prompt?: string;
  humor_flavor_id?: number;
  llm_prompt_chain_id?: number;
  humor_flavor_step_id?: number;
  [key: string]: unknown;
};

export default function LlmResponsesTable({
  initialData,
  totalCount,
  pageSize,
}: {
  initialData: LlmResponseRow[];
  totalCount: number;
  pageSize: number;
}) {
  const [data, setData] = useState<LlmResponseRow[]>(initialData);
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
      .from("llm_models_responses")
      .select("*", { count: "exact" })
      .order("id", { ascending: false })
      .range(from, to);

    if (q) {
      query = query.ilike("llm_model_response", `%${q}%`);
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

  const columns: Column<LlmResponseRow>[] = [
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
      key: "llm_model_id",
      header: "Model ID",
      render: (row) => (
        <span className="text-sm">{row.llm_model_id ?? "—"}</span>
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
      key: "llm_model_response",
      header: "Response",
      render: (row) => {
        const text = row.llm_model_response || "—";
        const isExpanded = expandedId === row.id;
        const isLong = text.length > 100;
        return (
          <span
            className="text-sm block max-w-md cursor-pointer"
            style={{
              color: row.llm_model_response ? "var(--foreground)" : "var(--muted)",
              whiteSpace: isExpanded ? "pre-wrap" : undefined,
            }}
            onClick={() => isLong && setExpandedId(isExpanded ? null : row.id)}
          >
            {isLong && !isExpanded ? text.slice(0, 100) + "..." : text}
          </span>
        );
      },
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
    <DataTable<LlmResponseRow>
      columns={columns}
      data={data}
      totalCount={count}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search responses..."
      isLoading={loading}
    />
  );
}
