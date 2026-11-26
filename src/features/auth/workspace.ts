import { ROUTES } from "@/config/routeDefinition";
import type { Tenancy } from "@/features/tenant-portal/types";
import type { AuthUser } from "./types";

export const Workspace = {
  Manage: "manage",
  Portal: "portal",
} as const;

export type Workspace = (typeof Workspace)[keyof typeof Workspace];

export const canManage = (
  user: Pick<AuthUser, "platformRole" | "organizations">,
) => !!user.platformRole || user.organizations.length > 0;

export const isTenant = (tenancy: Tenancy) => tenancy.totalLeaseCount > 0;

export const isTenantPortalPath = (pathname: string) =>
  pathname === ROUTES.tenantPortal ||
  pathname.startsWith(`${ROUTES.tenantPortal}/`);

export const getWorkspaceFromPath = (pathname: string): Workspace =>
  isTenantPortalPath(pathname) ? Workspace.Portal : Workspace.Manage;

export const getWorkspaceHomePath = (workspace: Workspace) =>
  workspace === Workspace.Portal ? ROUTES.tenantPortal : ROUTES.dashboard;

export function getHomePath(
  user: Pick<AuthUser, "platformRole" | "organizations">,
  tenancy: Tenancy | null,
  lastWorkspace: Workspace | null,
): string {
  const manage = canManage(user);
  const tenant = !!tenancy && isTenant(tenancy);

  if (manage && tenant) {
    return getWorkspaceHomePath(lastWorkspace ?? Workspace.Manage);
  }
  if (tenant) return ROUTES.tenantPortal;
  return ROUTES.dashboard;
}

export const needsTenancyForHome = (
  user: Pick<AuthUser, "platformRole" | "organizations">,
  lastWorkspace: Workspace | null,
) => !canManage(user) || lastWorkspace === Workspace.Portal;

export type WorkspaceAccess =
  | { kind: "allow" }
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "redirect"; to: string }
  | { kind: "noAccess" };

export function resolveWorkspaceAccess({
  workspace,
  canManage: manage,
  tenancy,
  isTenancyLoading,
  isTenancyError,
}: {
  workspace: Workspace;
  canManage: boolean;
  tenancy: Tenancy | undefined;
  isTenancyLoading: boolean;
  isTenancyError: boolean;
}): WorkspaceAccess {
  if (workspace === Workspace.Manage && manage) return { kind: "allow" };

  if (isTenancyError) return { kind: "error" };
  if (isTenancyLoading || !tenancy) return { kind: "loading" };

  const tenant = isTenant(tenancy);

  if (workspace === Workspace.Portal) {
    if (tenant) return { kind: "allow" };
    if (manage) return { kind: "redirect", to: ROUTES.dashboard };
    return { kind: "noAccess" };
  }

  if (tenant) return { kind: "redirect", to: ROUTES.tenantPortal };
  return { kind: "noAccess" };
}
