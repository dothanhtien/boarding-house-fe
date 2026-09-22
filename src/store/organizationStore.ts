import { create } from "zustand";
import { persist } from "zustand/middleware";

type OrganizationState = {
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (id: string) => void;
  clearSelectedOrganizationId: () => void;
};

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      selectedOrganizationId: null,
      setSelectedOrganizationId: (id) => set({ selectedOrganizationId: id }),
      clearSelectedOrganizationId: () => set({ selectedOrganizationId: null }),
    }),
    {
      name: "organization-storage",
    },
  ),
);
