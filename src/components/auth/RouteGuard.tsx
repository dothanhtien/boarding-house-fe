"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useMe } from "@/features/auth/queries";
import { useAllowedNavItems } from "@/hooks/useAllowedNavItems";
import { Unauthorized } from "@/components/auth/Unauthorized";
import { ROUTES } from "@/config/routeDefinition";

interface RouteGuardProps {
  children: React.ReactNode;
}

const ALWAYS_ALLOWED_PATHS: string[] = [ROUTES.profile];

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const { data: user, isLoading } = useMe();
  const allowedNavItems = useAllowedNavItems();

  const isPathAllowed =
    allowedNavItems.some(
      (item) =>
        item.path &&
        (pathname === item.path || pathname.startsWith(`${item.path}/`)),
    ) ||
    ALWAYS_ALLOWED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

  const isAllowed = !isLoading && !!user && isPathAllowed;

  if (isLoading) return null;
  if (!isAllowed) return <Unauthorized />;

  return <>{children}</>;
};
