import { useCallback } from "react";
import { useMe } from "@/features/auth/queries";
import { useOrganization } from "@/features/organizations/queries";
import { useOrganizationStore } from "@/store/organizationStore";

export function useActorName() {
  const { data: me } = useMe();
  const selectedOrganizationId = useOrganizationStore(
    (state) => state.selectedOrganizationId,
  );
  const { data: organization } = useOrganization(selectedOrganizationId ?? "", {
    enabled: !!selectedOrganizationId,
    retry: false,
  });
  const myId = me?.id;
  const members = organization?.members;

  return useCallback(
    (userId: string | null) => {
      if (!userId) return "System";
      if (userId === myId) return "You";
      if (!members) return "Another user";
      const member = members.find((m) => m.userId === userId);
      return member?.userFullName ?? "Former member";
    },
    [myId, members],
  );
}
