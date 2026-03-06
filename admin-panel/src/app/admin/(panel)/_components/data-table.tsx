"use client";

import { useState, useEffect, type ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export default function DataTable<T extends { id?: number | string }>({
  columns,
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  actions,
  headerActions,
  isLoading,
}: {
  columns: Column<T>[];
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  actions?: (row: T) => ReactNode;
  headerActions?: ReactNode;
  isLoading?: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalCount);

  // Debounced search
  const [inputValue, setInputValue] = useState(searchValue);
  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={searchPlaceholder ?? "Search..."}
          className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            color: "var(--foreground)",
          }}
        />
        {headerActions}
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden transition-colors"
        style={{
          border: "1px solid var(--card-border)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--subtle-bg)" }}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-4 py-3 font-medium text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    {col.header}
                  </th>
                ))}
                {actions && (
                  <th
                    className="text-right px-4 py-3 font-medium text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-12 text-center text-sm"
                    style={{ color: "var(--muted)" }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-12 text-center text-sm"
                    style={{ color: "var(--muted)" }}
                  >
                    No results found.
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr
                    key={row.id ?? i}
                    className="transition-colors"
                    style={{
                      borderTop: "1px solid var(--card-border)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--subtle-bg)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3"
                        style={{ color: "var(--foreground)" }}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-right">{actions(row)}</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: "var(--muted)" }}>
          {totalCount > 0
            ? `Showing ${from}-${to} of ${totalCount}`
            : "No results"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: "var(--btn-bg)", color: "var(--btn-text)" }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled)
                e.currentTarget.style.background = "var(--btn-bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--btn-bg)";
            }}
          >
            Prev
          </button>
          <span style={{ color: "var(--muted)" }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: "var(--btn-bg)", color: "var(--btn-text)" }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled)
                e.currentTarget.style.background = "var(--btn-bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--btn-bg)";
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
