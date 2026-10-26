"use client";

import React, { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import type { UtilityServicePreset } from "@/features/utility-services/constants";
import { UtilityTypeIcon } from "./UtilityTypeIcon";

interface AddUtilityServiceButtonProps {
  presets: UtilityServicePreset[];
  onAdd: (preset?: UtilityServicePreset) => void;
}

const itemClassName =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5";

export const AddUtilityServiceButton: React.FC<
  AddUtilityServiceButtonProps
> = ({ presets, onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (presets.length === 0) {
    return (
      <Button
        size="sm"
        startIcon={<Plus className="h-4 w-4" aria-hidden />}
        onClick={() => onAdd()}
      >
        Add service
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        type="button"
        size="sm"
        className="dropdown-toggle"
        startIcon={<Plus className="h-4 w-4" aria-hidden />}
        endIcon={<ChevronDown className="h-4 w-4" aria-hidden />}
        onClick={() => setIsOpen((open) => !open)}
      >
        Add service
      </Button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-56 p-1.5"
      >
        <ul role="menu">
          {presets.map((preset) => (
            <li key={preset.type} role="none">
              <DropdownItem
                onClick={() => onAdd(preset)}
                onItemClick={() => setIsOpen(false)}
                baseClassName={itemClassName}
              >
                <UtilityTypeIcon type={preset.type} className="h-4 w-4" />
                {preset.name}
              </DropdownItem>
            </li>
          ))}
          <li
            role="none"
            className="mt-1 border-t border-gray-200 pt-1 dark:border-gray-800"
          >
            <DropdownItem
              onClick={() => onAdd()}
              onItemClick={() => setIsOpen(false)}
              baseClassName={itemClassName}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Custom service
            </DropdownItem>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
};
