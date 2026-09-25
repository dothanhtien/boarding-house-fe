"use client";

import React, { useEffect, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import {
  getAmenityIconOption,
  ROOM_AMENITY_ICON_OPTIONS,
  type RoomAmenityIconOption,
} from "@/features/rooms/components/amenityIcons";
import { AmenityIcon } from "./AmenityIcon";

interface AmenityIconPickerProps {
  id?: string;
  value: string;
  onChange: (value: string, option?: RoomAmenityIconOption) => void;
}

export const AmenityIconPicker: React.FC<AmenityIconPickerProps> = ({
  id,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selected = getAmenityIconOption(value);

  function select(key: string, option?: RoomAmenityIconOption) {
    onChange(key, option);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        aria-label={selected ? `Icon: ${selected.label}` : "Choose an icon"}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={selected?.label ?? (value || "Choose an icon")}
        onClick={() => setIsOpen((open) => !open)}
        className={`shadow-theme-xs flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border bg-transparent dark:bg-gray-900 ${
          isOpen
            ? "border-brand-300 ring-brand-500/10 dark:border-brand-800 ring-3"
            : "border-gray-300 dark:border-gray-700"
        } ${value ? "text-gray-700 dark:text-gray-300" : "text-gray-400"}`}
      >
        {value ? (
          <AmenityIcon icon={value} className="h-5 w-5" />
        ) : (
          <ImagePlus className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <div className="shadow-theme-lg dark:bg-gray-dark absolute top-full left-0 z-40 mt-2 w-[17.5rem] rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800">
          <div className="grid grid-cols-6 gap-1">
            {ROOM_AMENITY_ICON_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = option.key === value;

              return (
                <button
                  key={option.key}
                  type="button"
                  title={option.label}
                  aria-label={option.label}
                  aria-pressed={isSelected}
                  onClick={() => select(option.key, option)}
                  className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg ${
                    isSelected
                      ? "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => select("")}
              className="mt-2 w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
            >
              Remove icon
            </button>
          )}
        </div>
      )}
    </div>
  );
};
