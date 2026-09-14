"use client";

import React, { useEffect, useRef, useState } from "react";
import Input from "@/components/form/input/InputField";

interface UsersFilterBarProps {
  onSearchChange: (search: string) => void;
}

export function UsersFilter({ onSearchChange }: UsersFilterBarProps) {
  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(searchInput.trim());
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <div className="w-full sm:max-w-xs">
      <Input
        type="text"
        placeholder="Search by name or email"
        onChange={(e) => setSearchInput(e.target.value)}
      />
    </div>
  );
}
