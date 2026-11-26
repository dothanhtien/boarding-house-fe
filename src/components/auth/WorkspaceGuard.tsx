"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GridShape from "@/components/common/GridShape";
import Button from "@/components/ui/button/Button";
import { ROUTES } from "@/config/routeDefinition";
import { useTheme } from "@/context/ThemeContext";
import { useLogout } from "@/features/auth/mutations";
import { useMe } from "@/features/auth/queries";
import {
  type Workspace,
  canManage,
  resolveWorkspaceAccess,
} from "@/features/auth/workspace";
import { useTenancy } from "@/features/tenant-portal/queries";
import { useWorkspaceStore } from "@/store/workspaceStore";

interface FullPageMessageProps {
  message: React.ReactNode;
  action: React.ReactNode;
}

const FullPageMessage: React.FC<FullPageMessageProps> = ({
  message,
  action,
}) => {
  const { theme } = useTheme();

  return (
    <div className="relative z-1 flex min-h-screen flex-col items-center overflow-hidden p-6">
      <GridShape />
      <div className="m-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <Image
          src={
            theme === "dark"
              ? "/images/error/403-dark.svg"
              : "/images/error/403.svg"
          }
          alt=""
          width={472}
          height={152}
        />
        <p className="mt-10 mb-6 text-base text-gray-700 sm:text-lg dark:text-gray-400">
          {message}
        </p>
        {action}
      </div>
    </div>
  );
};

const NoWorkspaceAccess: React.FC = () => {
  const logoutMutation = useLogout();

  return (
    <FullPageMessage
      message="Your account doesn't have access to any organization or rental yet."
      action={
        <Button
          size="sm"
          variant="outline"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          {logoutMutation.isPending ? "Signing out..." : "Sign out"}
        </Button>
      }
    />
  );
};

interface WorkspaceLoadErrorProps {
  onRetry: () => void;
  isRetrying: boolean;
  onGoToDashboard?: () => void;
}

const WorkspaceLoadError: React.FC<WorkspaceLoadErrorProps> = ({
  onRetry,
  isRetrying,
  onGoToDashboard,
}) => (
  <FullPageMessage
    message="We couldn't load your account. Please try again."
    action={
      <div className="flex items-center justify-center gap-3">
        <Button
          size="sm"
          variant="outline"
          disabled={isRetrying}
          onClick={onRetry}
        >
          {isRetrying ? "Retrying..." : "Retry"}
        </Button>
        {onGoToDashboard && (
          <Button size="sm" onClick={onGoToDashboard}>
            Go to dashboard
          </Button>
        )}
      </div>
    }
  />
);

interface WorkspaceGuardProps {
  workspace: Workspace;
  children: React.ReactNode;
}

const FullPageLoading: React.FC = () => (
  <div className="flex h-screen items-center justify-center">
    <span className="text-gray-500 dark:text-gray-400">Loading...</span>
  </div>
);

export const WorkspaceGuard: React.FC<WorkspaceGuardProps> = ({
  workspace,
  children,
}) => {
  const router = useRouter();
  const { data: user } = useMe();
  const setLastWorkspace = useWorkspaceStore((s) => s.setLastWorkspace);
  const tenancyQuery = useTenancy({ enabled: !!user });

  const manage = !!user && canManage(user);
  const access = resolveWorkspaceAccess({
    workspace,
    canManage: manage,
    tenancy: tenancyQuery.data,
    isTenancyLoading: tenancyQuery.isLoading,
    isTenancyError: tenancyQuery.isError && !tenancyQuery.data,
  });

  const redirectTo = access.kind === "redirect" ? access.to : null;
  const isAllowed = access.kind === "allow";

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  useEffect(() => {
    if (isAllowed) setLastWorkspace(workspace);
  }, [isAllowed, workspace, setLastWorkspace]);

  switch (access.kind) {
    case "allow":
      return <>{children}</>;
    case "noAccess":
      return <NoWorkspaceAccess />;
    case "error":
      return (
        <WorkspaceLoadError
          onRetry={() => tenancyQuery.refetch()}
          isRetrying={tenancyQuery.isFetching}
          onGoToDashboard={
            manage ? () => router.replace(ROUTES.dashboard) : undefined
          }
        />
      );
    default:
      return <FullPageLoading />;
  }
};
