"use client";

import React, { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { WorkspaceGuard } from "@/components/auth/WorkspaceGuard";
import { Workspace } from "@/features/auth/workspace";
import { AppShell } from "@/layout/AppShell";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <ProtectedRoute>
        <WorkspaceGuard workspace={Workspace.Portal}>
          <AppShell>{children}</AppShell>
        </WorkspaceGuard>
      </ProtectedRoute>
    </Suspense>
  );
}
