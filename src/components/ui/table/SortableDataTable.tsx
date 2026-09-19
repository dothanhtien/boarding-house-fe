import React, { ReactNode } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "./index";

export interface SortableColumn<T> {
  label: string;
  field?: string;
  render: (row: T) => ReactNode;
  cellClassName?: string;
}

interface SortableDataTableProps<T> {
  columns: SortableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading: boolean;
  isFetching?: boolean;
  hasError?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange: (field: string) => void;
  emptyMessage: string;
  minWidthClassName?: string;
}

export function SortableDataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  isFetching = false,
  hasError = false,
  sortBy,
  sortOrder,
  onSortChange,
  emptyMessage,
  minWidthClassName = "min-w-[900px]",
}: SortableDataTableProps<T>) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {isFetching && !isLoading && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-white/40 dark:bg-gray-900/40" />
      )}

      <div className="max-w-full overflow-x-auto">
        <div className={minWidthClassName}>
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.label}
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    {col.field ? (
                      <button
                        type="button"
                        onClick={() => onSortChange(col.field!)}
                        className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {col.label}
                        {sortBy === col.field && (
                          <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {isLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell
                    className="text-theme-sm px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                    colSpan={columns.length}
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !hasError && rows.length === 0 && (
                <TableRow>
                  <TableCell
                    className="text-theme-sm px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                    colSpan={columns.length}
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}

              {rows.map((row) => (
                <TableRow key={rowKey(row)}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.label}
                      className={
                        col.cellClassName ??
                        "text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400"
                      }
                    >
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
