import { RoleSlugs } from "@/config/roles";
import {
  NavItem,
  dashboardNavItem,
  organizationsNavItem,
  usersNavItem,
  organizationDetailNavItem,
} from "@/components/sidebar/navItems";

export type { NavItem };

const ORG_SCOPED_ROLE_SLUGS: string[] = [
  RoleSlugs.OrganizationAdmin,
  RoleSlugs.OrganizationStaff,
];

export const ROLE_NAV_ITEMS: Record<string, NavItem[]> = {
  [RoleSlugs.PlatformAdmin]: [
    dashboardNavItem,
    organizationsNavItem,
    usersNavItem,
  ],
  [RoleSlugs.PlatformStaff]: [
    dashboardNavItem,
    organizationsNavItem,
    usersNavItem,
  ],
  [RoleSlugs.OrganizationAdmin]: [dashboardNavItem],
  [RoleSlugs.OrganizationStaff]: [dashboardNavItem],
};

export const DEFAULT_NAV_ITEMS: NavItem[] = [dashboardNavItem];

export const getOrgRoleNavItems = (
  orgRoleSlug: string | null,
  selectedOrganizationId: string | null,
): NavItem[] => {
  if (!orgRoleSlug) return [];
  const items = ROLE_NAV_ITEMS[orgRoleSlug] ?? [];
  if (!ORG_SCOPED_ROLE_SLUGS.includes(orgRoleSlug) || !selectedOrganizationId) {
    return items;
  }
  return [...items, organizationDetailNavItem(selectedOrganizationId)];
};
