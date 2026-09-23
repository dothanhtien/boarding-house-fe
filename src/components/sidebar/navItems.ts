import type { ComponentType, SVGProps } from "react";
import { BuildingsIcon, GridIcon, HomeIcon, UserIcon } from "@/icons";
import { ROUTES } from "@/config/routeDefinition";
import { RoleSlugs } from "@/config/roles";

export type NavItem = {
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

export const dashboardNavItem: NavItem = {
  icon: GridIcon,
  name: "Dashboard",
  path: ROUTES.dashboard,
};

export const organizationsNavItem: NavItem = {
  icon: BuildingsIcon,
  name: "Organizations",
  path: ROUTES.organizations,
};

export const usersNavItem: NavItem = {
  icon: UserIcon,
  name: "Users",
  path: ROUTES.users,
};

export const propertiesNavItem: NavItem = {
  icon: HomeIcon,
  name: "Properties",
  path: ROUTES.properties,
};

export const organizationDetailNavItem = (organizationId: string): NavItem => {
  return {
    icon: BuildingsIcon,
    name: "Organization",
    path: ROUTES.organizationDetail(organizationId),
  };
};

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
  [RoleSlugs.OrganizationAdmin]: [
    dashboardNavItem,
    organizationsNavItem,
    propertiesNavItem,
  ],
  [RoleSlugs.OrganizationStaff]: [
    dashboardNavItem,
    organizationsNavItem,
    propertiesNavItem,
  ],
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

  return items.map((item) =>
    item.name === "Organizations"
      ? organizationDetailNavItem(selectedOrganizationId)
      : item,
  );
};
