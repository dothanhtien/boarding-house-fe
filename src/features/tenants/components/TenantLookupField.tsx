"use client";

import React, { useRef, useState } from "react";
import { HttpStatus } from "@/enums/httpStatus";
import { Search, UserPlus } from "lucide-react";
import Input from "@/components/form/input/InputField";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { useLookupTenant } from "@/features/tenants/mutations";
import type { TenantLookupResult } from "@/features/tenants/types";
import { isValidEmail, normalizeEmail } from "@/utils/email";
import { isValidPhone, normalizePhone } from "@/utils/phone";
import { CreateTenantModal } from "./CreateTenantModal";

export type SelectedTenant = {
  userId: string;
  fullName: string;
  phone: string | null;
};

type LookupMode = "phone" | "email";

interface TenantLookupFieldProps {
  excludeUserIds: string[];
  disabled?: boolean;
  onSelect: (tenant: SelectedTenant) => void;
}

const modeButtonClassName = (active: boolean) =>
  `cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition ${
    active
      ? "bg-white text-gray-800 shadow-theme-xs dark:bg-gray-800 dark:text-white/90"
      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
  }`;

export const TenantLookupField: React.FC<TenantLookupFieldProps> = ({
  excludeUserIds,
  disabled = false,
  onSelect,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<LookupMode>("phone");
  const [inputError, setInputError] = useState<string | null>(null);
  const [result, setResult] = useState<TenantLookupResult | null>(null);
  const [notFoundQuery, setNotFoundQuery] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const lookupMutation = useLookupTenant();

  const resetResult = () => {
    setInputError(null);
    setResult(null);
    setNotFoundQuery(null);
    lookupMutation.reset();
  };

  const switchMode = (next: LookupMode) => {
    if (next === mode) return;
    setMode(next);
    if (inputRef.current) inputRef.current.value = "";
    resetResult();
  };

  const clear = () => {
    if (inputRef.current) inputRef.current.value = "";
    resetResult();
  };

  const handleFind = () => {
    const raw = inputRef.current?.value ?? "";
    resetResult();

    const value = mode === "phone" ? normalizePhone(raw) : normalizeEmail(raw);
    const isValid =
      mode === "phone" ? isValidPhone(value) : isValidEmail(value);
    if (!isValid) {
      setInputError(
        mode === "phone"
          ? "Enter a 10-digit phone number starting with 0 or +84"
          : "Enter a valid email address",
      );
      return;
    }

    lookupMutation.mutate(
      mode === "phone" ? { phone: value } : { email: value },
      {
        onSuccess: setResult,
        onError: (error) => {
          if (error.status === HttpStatus.NotFound) setNotFoundQuery(value);
        },
      },
    );
  };

  const handleAdd = (tenant: SelectedTenant) => {
    onSelect(tenant);
    clear();
  };

  if (disabled) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Tenant limit reached for this room.
      </p>
    );
  }

  const isAlreadyAdded = !!result && excludeUserIds.includes(result.id);
  const canAdd = !!result && result.isActive && result.hasTenantProfile;
  const lookupError =
    lookupMutation.error && lookupMutation.error.status !== HttpStatus.NotFound
      ? lookupMutation.error.message
      : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="inline-flex w-fit gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
        <button
          type="button"
          className={modeButtonClassName(mode === "phone")}
          onClick={() => switchMode("phone")}
        >
          Phone
        </button>
        <button
          type="button"
          className={modeButtonClassName(mode === "email")}
          onClick={() => switchMode("email")}
        >
          Email
        </button>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Input
            key={mode}
            ref={inputRef}
            id="tenantLookup"
            type={mode === "phone" ? "tel" : "email"}
            placeholder={
              mode === "phone"
                ? "Tenant's phone, e.g. 0912 345 678"
                : "Tenant's email"
            }
            error={!!inputError}
            hint={inputError ?? undefined}
            onChange={() => {
              if (result || notFoundQuery || inputError) resetResult();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleFind();
              }
            }}
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          startIcon={<Search className="h-4 w-4" aria-hidden />}
          disabled={lookupMutation.isPending}
          onClick={handleFind}
        >
          {lookupMutation.isPending ? "Finding..." : "Find"}
        </Button>
      </div>

      {lookupError && <p className="text-error-500 text-sm">{lookupError}</p>}

      {result && (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                {result.fullName}
              </p>
              {!result.isActive && (
                <Badge size="sm" color="error">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {[result.maskedPhone, result.maskedEmail]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {!result.isActive ? (
              <p className="text-error-500 mt-1 text-xs">
                This account is locked and can&apos;t be added to a lease.
              </p>
            ) : (
              !result.hasTenantProfile && (
                <p className="text-error-500 mt-1 text-xs">
                  This account isn&apos;t a tenant and can&apos;t be added to a
                  lease.
                </p>
              )
            )}
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!canAdd || isAlreadyAdded}
            onClick={() =>
              handleAdd({
                userId: result.id,
                fullName: result.fullName,
                phone: result.maskedPhone,
              })
            }
          >
            {isAlreadyAdded ? "Already added" : "Add tenant"}
          </Button>
        </div>
      )}

      {notFoundQuery && (
        <div className="flex flex-col gap-3 rounded-lg border border-dashed border-gray-300 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tenant found with{" "}
            <span className="font-medium text-gray-800 dark:text-white/90">
              {notFoundQuery}
            </span>
            .
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            startIcon={<UserPlus className="h-4 w-4" aria-hidden />}
            onClick={() => setIsCreating(true)}
          >
            Create new tenant
          </Button>
        </div>
      )}

      {isCreating && (
        <CreateTenantModal
          initialPhone={mode === "phone" ? (notFoundQuery ?? "") : ""}
          initialEmail={mode === "email" ? (notFoundQuery ?? "") : ""}
          onClose={() => setIsCreating(false)}
          onCreated={(tenant) => {
            setIsCreating(false);
            handleAdd({
              userId: tenant.id,
              fullName: tenant.fullName,
              phone: tenant.phone,
            });
          }}
        />
      )}
    </div>
  );
};
