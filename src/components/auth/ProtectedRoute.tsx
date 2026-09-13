import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearSessionMarker, setSessionMarker } from "@/utils/sessionMarker";
import { useMe } from "@/features/auth/queries";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { data: user, isLoading, isError } = useMe();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (isError || !user) {
      clearSessionMarker();
      router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setSessionMarker();
    }
  }, [isLoading, isError, user, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
};
