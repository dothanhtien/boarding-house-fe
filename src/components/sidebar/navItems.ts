import type { ComponentType, SVGProps } from "react";
import {
  BoltIcon,
  BuildingsIcon,
  DocsIcon,
  GridIcon,
  HomeIcon,
  ReceiptIcon,
  UserIcon,
  WalletIcon,
} from "@/icons";
import { ROUTES } from "@/config/routeDefinition";
import { RoleSlugs } from "@/enums/roles";

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

export const leasesNavItem: NavItem = {
  icon: DocsIcon,
  name: "Leases",
  path: ROUTES.leases,
};

export const utilityReadingsNavItem: NavItem = {
  icon: BoltIcon,
  name: "Meter readings",
  path: ROUTES.utilityReadings(),
};

export const invoicesNavItem: NavItem = {
  icon: ReceiptIcon,
  name: "Invoices",
  path: ROUTES.invoices,
};

export const paymentsNavItem: NavItem = {
  icon: WalletIcon,
  name: "Payments",
  path: ROUTES.payments,
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
    leasesNavItem,
    utilityReadingsNavItem,
    invoicesNavItem,
    paymentsNavItem,
  ],
  [RoleSlugs.OrganizationStaff]: [
    dashboardNavItem,
    organizationsNavItem,
    propertiesNavItem,
    leasesNavItem,
    utilityReadingsNavItem,
    invoicesNavItem,
    paymentsNavItem,
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

export const TENANT_PORTAL_NAV_ITEMS: NavItem[] = [
  { icon: GridIcon, name: "Overview", path: ROUTES.tenantPortal },
  { icon: DocsIcon, name: "My leases", path: ROUTES.tenantPortalLeases },
  {
    icon: ReceiptIcon,
    name: "My invoices",
    path: ROUTES.tenantPortalInvoices(),
  },
  { icon: WalletIcon, name: "My payments", path: ROUTES.tenantPortalPayments },
];

export const WORKSPACE_HOME_PATHS: string[] = [
  ROUTES.dashboard,
  ROUTES.tenantPortal,
];
