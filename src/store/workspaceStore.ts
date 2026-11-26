import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workspace } from "@/features/auth/workspace";

type WorkspaceState = {
  lastWorkspace: Workspace | null;
  setLastWorkspace: (workspace: Workspace) => void;
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      lastWorkspace: null,
      setLastWorkspace: (workspace) => set({ lastWorkspace: workspace }),
    }),
    {
      name: "workspace-storage",
    },
  ),
);
