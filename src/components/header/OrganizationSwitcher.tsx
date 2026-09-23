"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { ROUTES } from "@/config/routeDefinition";
import { organizationKeys } from "@/features/organizations/queries";
import { propertyKeys } from "@/features/properties/queries";
import { userKeys } from "@/features/users/queries";
import { useUserRole } from "@/hooks/useUserRole";
import { ChevronDownIcon } from "@/icons";
import { useOrganizationStore } from "@/store/organizationStore";

export const OrganizationSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { organizations } = useUserRole();
  const selectedOrganizationId = useOrganizationStore(
    (s) => s.selectedOrganizationId,
  );
  const setSelectedOrganizationId = useOrganizationStore(
    (s) => s.setSelectedOrganizationId,
  );

  if (organizations.length <= 1) return null;

  const selectedOrganization = organizations.find(
    (org) => org.organizationId === selectedOrganizationId,
  );

  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="relative w-48">
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle shadow-theme-xs flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-left text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
      >
        <span className="truncate">
          {selectedOrganization?.organizationName ?? "Select organization"}
        </span>
        <ChevronDownIcon
          className={`text-gray-500 transition-transform duration-200 dark:text-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="shadow-theme-lg dark:bg-gray-dark left-0 flex w-full min-w-max flex-col gap-1 rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-800"
      >
        {organizations.map((org) => (
          <DropdownItem
            key={org.organizationId}
            onItemClick={() => {
              closeDropdown();
              if (org.organizationId === selectedOrganizationId) return;

              setSelectedOrganizationId(org.organizationId);
              queryClient.invalidateQueries({
                queryKey: organizationKeys.all,
              });
              queryClient.invalidateQueries({ queryKey: propertyKeys.all });
              queryClient.invalidateQueries({ queryKey: userKeys.all });
              router.push(ROUTES.dashboard);
            }}
            baseClassName=""
            className={`text-theme-sm block w-full rounded-lg px-3 py-2 text-left font-medium ${
              org.organizationId === selectedOrganizationId
                ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            }`}
          >
            {org.organizationName}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
};
