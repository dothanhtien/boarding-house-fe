"use client";

import { useMe } from "@/features/auth/queries";
import { useOrganizationStore } from "@/store/organizationStore";

export const useUserRole = () => {
  const { data: user } = useMe();
  const selectedOrganizationId = useOrganizationStore(
    (s) => s.selectedOrganizationId,
  );

  const platformRoleSlug = user?.platformRole?.slug ?? null;

  const currentOrgRoleSlug = user?.organizations?.find(
    (o) => o.organizationId === selectedOrganizationId,
  )?.roleSlug;

  return {
    organizations: user?.organizations ?? [],
    selectedOrganizationId,
    platformRoleSlug,
    currentOrgRoleSlug: currentOrgRoleSlug ?? null,
  };
};
