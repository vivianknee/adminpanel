"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import DataTable, { type Column } from "./data-table";

type CaptionRow = {
  id: number;
  content: string;
  like_count: number;
  created_datetime_utc?: string;
  images: { url: string } | { url: string }[] | null;
};

function getImageUrl(images: CaptionRow["images"]): string | null {
  if (!images) return null;
  if (Array.isArray(images)) return images[0]?.url ?? null;
  return images.url ?? null;
}

export default function CaptionsTable({
  initialData,
  totalCount,
  pageSize,
}: {
  initialData: CaptionRow[];
  totalCount: number;
  pageSize: number;
}) {
  const [data, setData] = useState<CaptionRow[]>(initialData);
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
      .from("captions")
      .select("id, content, like_count, created_datetime_utc, images(url)", {
        count: "exact",
      })
      .order("id", { ascending: false })
      .range(from, to);

    if (q) {
      query = query.ilike("content", `%${q}%`);
    }

    const { data: rows, count: total } = await query;
    setData((rows as CaptionRow[]) ?? []);
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

  const columns: Column<CaptionRow>[] = [
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
      key: "image",
      header: "Image",
      render: (row) => {
        const url = getImageUrl(row.images);
        return url ? (
          <img
            src={url}
            alt=""
            className="w-10 h-10 rounded-lg object-cover"
            style={{ background: "var(--subtle-bg)" }}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xs"
            style={{
              background: "var(--subtle-bg)",
              color: "var(--muted)",
            }}
          >
            —
          </div>
        );
      },
    },
    {
      key: "content",
      header: "Caption",
      render: (row) => (
        <div className="max-w-sm">
          <p
            className={`text-sm ${expandedId === row.id ? "" : "truncate"} cursor-pointer`}
            style={{ color: "var(--foreground)" }}
            onClick={() =>
              setExpandedId(expandedId === row.id ? null : row.id)
            }
            title="Click to expand"
          >
            {row.content}
          </p>
        </div>
      ),
    },
    {
      key: "like_count",
      header: "Likes",
      render: (row) => (
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            background:
              row.like_count > 0
                ? "var(--vote-up-hover-bg)"
                : row.like_count < 0
                  ? "var(--vote-down-hover-bg)"
                  : "var(--subtle-bg)",
            color:
              row.like_count > 0
                ? "var(--vote-up-hover-text)"
                : row.like_count < 0
                  ? "var(--vote-down-hover-text)"
                  : "var(--muted)",
          }}
        >
          {row.like_count}
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
    <DataTable<CaptionRow>
      columns={columns}
      data={data}
      totalCount={count}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search caption text..."
      isLoading={loading}
    />
  );
}
