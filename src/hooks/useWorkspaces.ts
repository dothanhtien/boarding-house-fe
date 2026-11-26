"use client";

import { usePathname } from "next/navigation";
import { useMe } from "@/features/auth/queries";
import {
  canManage,
  getWorkspaceFromPath,
  isTenant,
} from "@/features/auth/workspace";
import { useTenancy } from "@/features/tenant-portal/queries";

export const useWorkspaces = () => {
  const pathname = usePathname();
  const { data: user } = useMe();
  const tenancyQuery = useTenancy({ enabled: !!user });

  return {
    current: getWorkspaceFromPath(pathname),
    canManage: !!user && canManage(user),
    isTenant: !!tenancyQuery.data && isTenant(tenancyQuery.data),
    tenancy: tenancyQuery.data,
    tenancyQuery,
  };
};
