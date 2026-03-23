"use client";

import { useState, useEffect, type ReactNode } from "react";
import ConfirmDialog from "./confirm-dialog";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export type ExportColumn<T> = {
  header: string;
  value: (row: T) => string;
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
  exportFilename,
  exportColumns,
  selectable,
  onBulkDelete,
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
  exportFilename?: string;
  exportColumns?: ExportColumn<T>[];
  selectable?: boolean;
  onBulkDelete?: (ids: (number | string)[]) => Promise<void>;
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

  // Selection state
  const [selected, setSelected] = useState<Set<number | string>>(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Clear selection on page/search change
  useEffect(() => {
    setSelected(new Set());
  }, [page, searchValue]);

  const allIds = data.map((row) => row.id).filter((id): id is number | string => id != null);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  };

  const toggleOne = (id: number | string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  // CSV export
  const handleExport = () => {
    if (!exportColumns || data.length === 0) return;
    const header = exportColumns.map((c) => `"${c.header}"`).join(",");
    const rows = data.map((row) =>
      exportColumns.map((c) => `"${c.value(row).replace(/"/g, '""')}"`).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFilename ?? "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!onBulkDelete) return;
    setBulkDeleting(true);
    await onBulkDelete(Array.from(selected));
    setSelected(new Set());
    setBulkDeleting(false);
    setBulkConfirmOpen(false);
  };

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
        <div className="flex items-center gap-2">
          {exportColumns && (
            <button
              onClick={handleExport}
              disabled={data.length === 0}
              className="px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
              style={{ background: "var(--btn-bg)", color: "var(--btn-text)" }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled)
                  e.currentTarget.style.background = "var(--btn-bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--btn-bg)";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>
          )}
          {headerActions}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectable && selected.size > 0 && (
        <div
          className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium"
          style={{
            background: "var(--bulk-bar-bg)",
            color: "var(--bulk-bar-text)",
          }}
        >
          <span>{selected.size} item{selected.size !== 1 ? "s" : ""} selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1 rounded-md text-xs cursor-pointer transition-opacity hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.2)", color: "var(--bulk-bar-text)" }}
            >
              Clear
            </button>
            {onBulkDelete && (
              <button
                onClick={() => setBulkConfirmOpen(true)}
                className="px-3 py-1 rounded-md text-xs cursor-pointer font-medium transition-colors"
                style={{ background: "#dc2626", color: "#fff" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#b91c1c")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#dc2626")}
              >
                Delete Selected
              </button>
            )}
          </div>
        </div>
      )}

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
                {selectable && (
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="accent-[var(--accent)] w-3.5 h-3.5 cursor-pointer"
                    />
                  </th>
                )}
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
                    colSpan={columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)}
                    className="px-4 py-12 text-center text-sm"
                    style={{ color: "var(--muted)" }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-5 h-5 border-2 rounded-full animate-spin"
                        style={{
                          borderColor: "var(--card-border)",
                          borderTopColor: "var(--accent)",
                        }}
                      />
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)}
                    className="px-4 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--muted)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-40"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <span className="text-sm" style={{ color: "var(--muted)" }}>
                        No results found
                      </span>
                      <span className="text-xs" style={{ color: "var(--muted-2)" }}>
                        Try adjusting your search or filters
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr
                    key={row.id ?? i}
                    className="transition-colors"
                    style={{
                      borderTop: "1px solid var(--card-border)",
                      background: row.id != null && selected.has(row.id)
                        ? "var(--subtle-bg)"
                        : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!(row.id != null && selected.has(row.id)))
                        e.currentTarget.style.background = "var(--subtle-bg)";
                    }}
                    onMouseLeave={(e) => {
                      if (!(row.id != null && selected.has(row.id)))
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {selectable && (
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={row.id != null && selected.has(row.id)}
                          onChange={() => row.id != null && toggleOne(row.id)}
                          className="accent-[var(--accent)] w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>
                    )}
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

      {/* Bulk delete confirmation */}
      <ConfirmDialog
        isOpen={bulkConfirmOpen}
        title="Delete Selected Items"
        message={`Are you sure you want to delete ${selected.size} selected item${selected.size !== 1 ? "s" : ""}? This action cannot be undone.`}
        confirmLabel={bulkDeleting ? "Deleting..." : "Delete All"}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkConfirmOpen(false)}
      />
    </div>
  );
}
