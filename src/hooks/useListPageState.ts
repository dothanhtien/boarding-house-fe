"use client";
import { useState } from "react";

export function useListPageState() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleSortChange(field: string) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  }

  function handlePageChange(nextPage: number, totalPages: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  }

  function handleItemDeleted(remainingOnPage: number, refetch: () => void) {
    if (page > 1 && remainingOnPage === 1) {
      setPage((prev) => prev - 1);
    } else {
      refetch();
    }
  }

  return {
    page,
    search,
    sortBy,
    sortOrder,
    setSearch: handleSearchChange,
    handleSortChange,
    handlePageChange,
    handleItemDeleted,
  };
}
