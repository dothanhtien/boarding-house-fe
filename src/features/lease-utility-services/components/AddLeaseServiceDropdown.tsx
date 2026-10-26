"use client";

import React, { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import { UtilityTypeIcon } from "@/features/utility-services/components/UtilityTypeIcon";
import type { UtilityService } from "@/features/utility-services/types";
import { formatUnitPrice } from "@/features/utility-services/utils";

interface AddLeaseServiceDropdownProps {
  services: UtilityService[];
  isLoading: boolean;
  disabled?: boolean;
  onSelect: (service: UtilityService) => void;
}

export const AddLeaseServiceDropdown: React.FC<
  AddLeaseServiceDropdownProps
> = ({ services, isLoading, disabled = false, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isEmpty = !isLoading && services.length === 0;
  const isDisabled = disabled || isLoading || isEmpty;

  const button = (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => setIsOpen((open) => !open)}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      className="dropdown-toggle inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-gray-300 transition ring-inset hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
    >
      <Plus className="h-4 w-4" aria-hidden />
      Add service
      <ChevronDown className="h-4 w-4" aria-hidden />
    </button>
  );

  return (
    <div className="relative">
      {isEmpty ? (
        <Tooltip content="All active services of this property are already on this lease">
          {button}
        </Tooltip>
      ) : (
        button
      )}

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-72 p-1.5"
      >
        <ul role="menu">
          {services.map((service) => (
            <li key={service.id} role="none">
              <DropdownItem
                onClick={() => onSelect(service)}
                onItemClick={() => setIsOpen(false)}
                baseClassName="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
              >
                <UtilityTypeIcon type={service.type} className="h-4 w-4" />
                <span className="min-w-0 flex-1 truncate">{service.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatUnitPrice(service.defaultUnitPrice, service.unit)}
                </span>
              </DropdownItem>
            </li>
          ))}
        </ul>
      </Dropdown>
    </div>
  );
};
