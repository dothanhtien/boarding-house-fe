"use client";

import React, { useEffect, useRef, useState } from "react";
import Input from "@/components/form/input/InputField";

interface SearchInputProps {
  onSearchChange: (search: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearchChange,
  placeholder = "Search",
  debounceMs = 400,
  className = "w-full sm:max-w-xs",
}) => {
  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(searchInput.trim());
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <div className={className}>
      <Input
        type="text"
        placeholder={placeholder}
        onChange={(e) => setSearchInput(e.target.value)}
      />
    </div>
  );
};
