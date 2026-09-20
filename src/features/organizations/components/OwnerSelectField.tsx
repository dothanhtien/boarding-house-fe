"use client";

import { useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import Label from "@/components/form/Label";
import { SearchableSelect } from "@/components/form/SearchableSelect";
import { useUsers } from "@/features/users/queries";

interface OwnerSelectFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  error?: string;
  valueLabel?: string;
}

export const OwnerSelectField = <TFieldValues extends FieldValues>({
  control,
  name,
  error,
  valueLabel,
}: OwnerSelectFieldProps<TFieldValues>) => {
  const [ownerSearch, setOwnerSearch] = useState("");
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({
    isActive: true,
    search: ownerSearch || undefined,
    pageSize: 20,
  });
  const userOptions = (usersData?.items ?? []).map((user) => ({
    value: user.id,
    label: `${user.fullName} (${user.email})`,
  }));

  return (
    <div>
      <Label htmlFor={name}>
        Owner <span className="text-red-500">*</span>
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <SearchableSelect
            options={userOptions}
            placeholder={
              isLoadingUsers ? "Loading users..." : "Select an owner"
            }
            searchPlaceholder="Search by name or email..."
            emptyMessage="No users found."
            isLoading={isLoadingUsers}
            value={field.value as string}
            valueLabel={valueLabel}
            onChange={field.onChange}
            onSearchChange={setOwnerSearch}
            error={!!error}
          />
        )}
      />
      {error && <p className="text-error-500 mt-1.5 text-sm">{error}</p>}
    </div>
  );
};
