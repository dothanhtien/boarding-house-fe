"use client";

import React, { useRef } from "react";

export interface TabItem<T extends string> {
  value: T;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}

export const Tabs = <T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
  className = "",
}: TabsProps<T>) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (index: number) => {
    const nextIndex = (index + tabs.length) % tabs.length;
    onChange(tabs[nextIndex].value);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "ArrowRight") focusTab(index + 1);
    else if (event.key === "ArrowLeft") focusTab(index - 1);
    else if (event.key === "Home") focusTab(0);
    else if (event.key === "End") focusTab(tabs.length - 1);
    else return;

    event.preventDefault();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex gap-1 border-b border-gray-200 dark:border-gray-800 ${className}`}
    >
      {tabs.map((tab, index) => {
        const isSelected = tab.value === value;

        return (
          <button
            key={tab.value}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(tab.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`-mb-px cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition focus-visible:outline-hidden ${
              isSelected
                ? "border-brand-500 text-brand-500 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:text-gray-700 focus-visible:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
