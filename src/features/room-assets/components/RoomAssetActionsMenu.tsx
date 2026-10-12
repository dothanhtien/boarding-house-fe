"use client";

import React, { useState } from "react";
import {
  ClipboardPlus,
  Eye,
  MoreVertical,
  Split,
  SquarePen,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

export type RoomAssetAction = "view" | "edit" | "record" | "split" | "delete";

const ACTIONS: { action: RoomAssetAction; label: string; icon: LucideIcon }[] =
  [
    { action: "view", label: "View details", icon: Eye },
    { action: "edit", label: "Edit info", icon: SquarePen },
    { action: "record", label: "Record condition", icon: ClipboardPlus },
    { action: "split", label: "Split", icon: Split },
    { action: "delete", label: "Delete", icon: Trash2 },
  ];

interface RoomAssetActionsMenuProps {
  assetName: string;
  canSplit: boolean;
  onAction: (action: RoomAssetAction) => void;
}

export const RoomAssetActionsMenu: React.FC<RoomAssetActionsMenuProps> = ({
  assetName,
  canSplit,
  onAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`Actions for ${assetName}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="dropdown-toggle flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
      >
        <MoreVertical className="h-4 w-4" aria-hidden />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-48 p-1.5"
      >
        <ul role="menu">
          {ACTIONS.map(({ action, label, icon: Icon }) => {
            const disabled = action === "split" && !canSplit;
            return (
              <li key={action} role="none">
                <DropdownItem
                  onClick={() => onAction(action)}
                  onItemClick={() => setIsOpen(false)}
                  disabled={disabled}
                  baseClassName={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${
                    disabled
                      ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
                      : action === "delete"
                        ? "text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 cursor-pointer"
                        : "cursor-pointer text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </DropdownItem>
              </li>
            );
          })}
        </ul>
      </Dropdown>
    </div>
  );
};
