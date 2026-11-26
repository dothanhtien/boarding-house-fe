"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { ROUTES } from "@/config/routeDefinition";
import { Workspace } from "@/features/auth/workspace";
import { invoiceKeys } from "@/features/invoices/queries";
import { leaseUtilityServiceKeys } from "@/features/lease-utility-services/queries";
import { leaseKeys } from "@/features/leases/queries";
import { organizationKeys } from "@/features/organizations/queries";
import { paymentKeys } from "@/features/payments/queries";
import { propertyKeys } from "@/features/properties/queries";
import { roomKeys } from "@/features/rooms/queries";
import { userKeys } from "@/features/users/queries";
import { utilityReadingKeys } from "@/features/utility-readings/queries";
import { utilityServiceKeys } from "@/features/utility-services/queries";
import { useUserRole } from "@/hooks/useUserRole";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { ChevronDownIcon } from "@/icons";
import { useOrganizationStore } from "@/store/organizationStore";

export const TENANT_PORTAL_LABEL = "My rentals";
const PLATFORM_LABEL = "Platform";

const ORGANIZATION_SCOPED_KEYS = [
  organizationKeys.all,
  propertyKeys.all,
  roomKeys.all,
  userKeys.all,
  leaseKeys.all,
  utilityServiceKeys.all,
  leaseUtilityServiceKeys.all,
  utilityReadingKeys.all,
  invoiceKeys.all,
  paymentKeys.all,
];

type Option =
  | { kind: "platform"; key: string; label: string }
  | { kind: "organization"; key: string; label: string; organizationId: string }
  | { kind: "portal"; key: string; label: string };

const itemClassName = (isActive: boolean) =>
  `text-theme-sm block w-full rounded-lg px-3 py-2 text-left font-medium ${
    isActive
      ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400"
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
  }`;

interface WorkspaceSwitcherProps {
  className?: string;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  className = "w-48",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { organizations, platformRoleSlug } = useUserRole();
  const { current, isTenant } = useWorkspaces();
  const selectedOrganizationId = useOrganizationStore(
    (s) => s.selectedOrganizationId,
  );
  const setSelectedOrganizationId = useOrganizationStore(
    (s) => s.setSelectedOrganizationId,
  );

  const isInPortal = current === Workspace.Portal;

  const manageOptions: Option[] =
    organizations.length > 0
      ? organizations.map((org) => ({
          kind: "organization",
          key: org.organizationId,
          label: org.organizationName,
          organizationId: org.organizationId,
        }))
      : platformRoleSlug
        ? [{ kind: "platform", key: "platform", label: PLATFORM_LABEL }]
        : [];
  const portalOption: Option | null = isTenant
    ? { kind: "portal", key: "portal", label: TENANT_PORTAL_LABEL }
    : null;

  if (manageOptions.length + (portalOption ? 1 : 0) <= 1) return null;

  const isActive = (option: Option) => {
    if (option.kind === "portal") return isInPortal;
    if (isInPortal) return false;
    if (option.kind === "platform") return true;
    return option.organizationId === selectedOrganizationId;
  };

  const buttonLabel = isInPortal
    ? TENANT_PORTAL_LABEL
    : (manageOptions.find(isActive)?.label ?? "Select organization");

  const closeDropdown = () => setIsOpen(false);

  const select = (option: Option) => {
    closeDropdown();
    if (isActive(option)) return;

    if (option.kind === "portal") {
      router.push(ROUTES.tenantPortal);
      return;
    }

    if (
      option.kind === "organization" &&
      option.organizationId !== selectedOrganizationId
    ) {
      setSelectedOrganizationId(option.organizationId);
      ORGANIZATION_SCOPED_KEYS.forEach((queryKey) =>
        queryClient.removeQueries({ queryKey }),
      );
    }
    router.push(ROUTES.dashboard);
  };

  const renderOption = (option: Option) => (
    <DropdownItem
      key={option.key}
      onItemClick={() => select(option)}
      baseClassName=""
      className={itemClassName(isActive(option))}
    >
      {option.label}
    </DropdownItem>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="dropdown-toggle shadow-theme-xs flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-left text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
      >
        <span className="truncate">{buttonLabel}</span>
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
        {manageOptions.length > 0 && (
          <>
            <p className="px-3 pt-1 pb-0.5 text-xs font-medium tracking-wide text-gray-400 uppercase">
              Manage
            </p>
            {manageOptions.map(renderOption)}
          </>
        )}
        {portalOption && (
          <>
            {manageOptions.length > 0 && (
              <div className="my-1 border-t border-gray-100 dark:border-white/5" />
            )}
            {renderOption(portalOption)}
          </>
        )}
      </Dropdown>
    </div>
  );
};
