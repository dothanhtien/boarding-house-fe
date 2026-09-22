import React, { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { consumeLoggingOut } from "@/features/auth/mutations";
import { useMe } from "@/features/auth/queries";
import { clearSessionMarker, setSessionMarker } from "@/utils/sessionMarker";
import { ROUTES } from "@/config/routeDefinition";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const {
    data: user,
    isLoading,
    isFetching,
    isError,
  } = useMe({ refetchOnMount: "always" });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isChecking = isLoading || isFetching;

  useEffect(() => {
    if (isChecking) return;

    if (isError || !user) {
      clearSessionMarker();
      if (consumeLoggingOut()) {
        router.replace(ROUTES.signIn);
        return;
      }
      const search = searchParams.toString();
      const redirectTarget = search ? `${pathname}?${search}` : pathname;
      router.replace(
        `${ROUTES.signIn}?redirect=${encodeURIComponent(redirectTarget)}`,
      );
    } else {
      setSessionMarker();
    }
  }, [isChecking, isError, user, router, pathname, searchParams]);

  if (isChecking || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
};
