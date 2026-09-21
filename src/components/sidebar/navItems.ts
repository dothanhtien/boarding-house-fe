import { BuildingsIcon, GridIcon, UserIcon } from "@/icons";
import { ROUTES } from "@/config/routeDefinition";
import type { ComponentType, SVGProps } from "react";

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

export const organizationDetailNavItem = (organizationId: string): NavItem => {
  return {
    icon: BuildingsIcon,
    name: "Organization",
    path: ROUTES.organizationDetail(organizationId),
  };
};
