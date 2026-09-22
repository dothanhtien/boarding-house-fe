"use client";

import React, { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useSidebar } from "@/context/SidebarContext";
import { useSyncSelectedOrganization } from "@/hooks/useSyncSelectedOrganization";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  useSyncSelectedOrganization();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <Suspense>
      <ProtectedRoute>
        <div className="min-h-screen xl:flex">
          <AppSidebar />
          <Backdrop />
          <div
            className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${mainContentMargin}`}
          >
            <AppHeader />
            <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-1 flex-col p-4 md:p-6">
              <RouteGuard>{children}</RouteGuard>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </Suspense>
  );
}
