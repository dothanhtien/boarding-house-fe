"use client";

import { usePathname } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import {
  DEFAULT_NAV_ITEMS,
  ROLE_NAV_ITEMS,
  TENANT_PORTAL_NAV_ITEMS,
  getOrgRoleNavItems,
  type NavItem,
} from "@/components/sidebar/navItems";
import { isTenantPortalPath } from "@/features/auth/workspace";

export const useAllowedNavItems = (): NavItem[] => {
  const pathname = usePathname();
  const { platformRoleSlug, currentOrgRoleSlug, selectedOrganizationId } =
    useUserRole();

  if (isTenantPortalPath(pathname)) return TENANT_PORTAL_NAV_ITEMS;

  const platformNavItems = platformRoleSlug
    ? (ROLE_NAV_ITEMS[platformRoleSlug] ?? DEFAULT_NAV_ITEMS)
    : DEFAULT_NAV_ITEMS;
  const orgNavItems = getOrgRoleNavItems(
    currentOrgRoleSlug,
    selectedOrganizationId,
  );

  return [...platformNavItems, ...orgNavItems].filter(
    (item, index, all) => all.findIndex((i) => i.path === item.path) === index,
  );
};
