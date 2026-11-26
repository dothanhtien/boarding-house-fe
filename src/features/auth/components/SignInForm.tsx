"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { tenancyQueryOptions } from "@/features/tenant-portal/queries";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import type { ApiError } from "@/lib/axios";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { getSafeRedirect } from "@/utils/redirect";
import { useLogin } from "../mutations";
import type { AuthUser } from "../types";
import { getHomePath, needsTenancyForHome } from "../workspace";

export default function SignInForm() {
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const queryClient = useQueryClient();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isSigningIn = loginMutation.isPending || isRedirecting;

  async function resolveHomePath(user: AuthUser) {
    const { lastWorkspace } = useWorkspaceStore.getState();
    if (!needsTenancyForHome(user, lastWorkspace)) {
      return getHomePath(user, null, lastWorkspace);
    }
    try {
      const tenancy = await queryClient.fetchQuery(tenancyQueryOptions);
      return getHomePath(user, tenancy, lastWorkspace);
    } catch {
      return getHomePath(user, null, lastWorkspace);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const identifier = loginData.identifier?.trim();
    const password = loginData.password?.trim();

    if (!identifier) {
      setError("Email or phone is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    loginMutation.mutate(
      { identifier, password },
      {
        onSuccess: async (user) => {
          setLoginData({ identifier: "", password: "" });
          const redirect = searchParams.get("redirect");
          if (redirect) {
            router.replace(getSafeRedirect(redirect));
            return;
          }
          setIsRedirecting(true);
          router.replace(await resolveHomePath(user));
        },
        onError: (error: ApiError) => {
          setError(error.message ?? "An error occurred when signing in");
        },
      },
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {error && <p className="text-error-500 text-sm">{error}</p>}
                <div>
                  <Label>
                    Email or phone{" "}
                    <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="Email or phone number"
                    type="text"
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        identifier: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      onChange={(e) =>
                        setLoginData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Link
                    href="/reset-password"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400 text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm" disabled={isSigningIn}>
                    {isSigningIn ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-center text-sm font-normal text-gray-700 sm:text-start dark:text-gray-400">
                Don&apos;t have an account? {""}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
