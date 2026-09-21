"use client";

import { useEffect } from "react";
import { useMe } from "@/features/auth/queries";
import { useOrganizationStore } from "@/store/organizationStore";

export const useSyncSelectedOrganization = () => {
  const { data: user } = useMe();
  const selectedOrganizationId = useOrganizationStore(
    (s) => s.selectedOrganizationId,
  );
  const setSelectedOrganizationId = useOrganizationStore(
    (s) => s.setSelectedOrganizationId,
  );

  useEffect(() => {
    const organizations = user?.organizations ?? [];
    if (organizations.length === 0) return;

    const isSelectedValid = organizations.some(
      (o) => o.organizationId === selectedOrganizationId,
    );
    if (!isSelectedValid) {
      setSelectedOrganizationId(organizations[0].organizationId);
    }
  }, [user, selectedOrganizationId, setSelectedOrganizationId]);
};
