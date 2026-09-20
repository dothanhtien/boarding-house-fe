"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/icons";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  valueLabel?: string;
  onChange: (value: string) => void;
  onSearchChange?: (search: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  error?: boolean;
  debounceMs?: number;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value = "",
  valueLabel,
  onChange,
  onSearchChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  isLoading = false,
  emptyMessage = "No results found",
  className = "",
  error = false,
  debounceMs = 300,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(
    valueLabel ?? null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? (value ? selectedLabel : null);

  useEffect(() => {
    if (selectedOption) {
      setSelectedLabel(selectedOption.label);
    } else if (!value) {
      setSelectedLabel(null);
    } else if (valueLabel) {
      setSelectedLabel(valueLabel);
    }
  }, [selectedOption, value, valueLabel]);

  useEffect(() => {
    if (!onSearchChange) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(searchInput.trim());
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setSelectedLabel(option.label);
    setSearchInput("");
    onSearchChange?.("");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`shadow-theme-xs flex h-11 w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm focus:ring-3 focus:outline-hidden ${
          error
            ? "border-red-500"
            : "focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 border-gray-300"
        } dark:border-gray-700 dark:bg-gray-900 ${
          displayLabel
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-400"
        } ${className}`}
      >
        <span className="truncate">{displayLabel ?? placeholder}</span>
        <ChevronDownIcon className="h-5 w-5 shrink-0 text-gray-400" />
      </button>

      {isOpen && (
        <div className="shadow-theme-lg dark:bg-gray-dark absolute z-40 mt-2 w-full rounded-xl border border-gray-200 bg-white dark:border-gray-800">
          <div className="p-2">
            <input
              autoFocus
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={searchPlaceholder}
              className="focus:border-brand-300 h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          <ul className="custom-scrollbar max-h-60 overflow-y-auto px-2 pb-2">
            {isLoading ? (
              <li className="px-2 py-2 text-sm text-gray-400">Loading...</li>
            ) : options.length === 0 ? (
              <li className="px-2 py-2 text-sm text-gray-400">
                {emptyMessage}
              </li>
            ) : (
              options.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full rounded-md px-2 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 ${
                      option.value === value
                        ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
