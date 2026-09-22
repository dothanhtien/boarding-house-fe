"use client";

import { useUserRole } from "@/hooks/useUserRole";
import {
  DEFAULT_NAV_ITEMS,
  ROLE_NAV_ITEMS,
  getOrgRoleNavItems,
  type NavItem,
} from "@/components/sidebar/navigation";

export const useAllowedNavItems = (): NavItem[] => {
  const { platformRoleSlug, currentOrgRoleSlug, selectedOrganizationId } =
    useUserRole();

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
