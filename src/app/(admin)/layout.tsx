"use client";

import React, { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { WorkspaceGuard } from "@/components/auth/WorkspaceGuard";
import { Workspace } from "@/features/auth/workspace";
import { useSyncSelectedOrganization } from "@/hooks/useSyncSelectedOrganization";
import { AppShell } from "@/layout/AppShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useSyncSelectedOrganization();

  return (
    <Suspense>
      <ProtectedRoute>
        <WorkspaceGuard workspace={Workspace.Manage}>
          <AppShell>
            <RouteGuard>{children}</RouteGuard>
          </AppShell>
        </WorkspaceGuard>
      </ProtectedRoute>
    </Suspense>
  );
}
