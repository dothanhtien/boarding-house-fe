"use client";

import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Trash2 } from "lucide-react";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { INVOICE_MAX_CUSTOM_ITEMS } from "@/features/invoices/constants";
import {
  EMPTY_CUSTOM_ITEM,
  type CustomItemFormValue,
} from "@/features/invoices/schemas";
import { PlusIcon } from "@/icons";

type FormWithCustomItems = { customItems: CustomItemFormValue[] };

interface CustomItemsFieldsProps {
  disabled?: boolean;
}

export const CustomItemsFields: React.FC<CustomItemsFieldsProps> = ({
  disabled = false,
}) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<FormWithCustomItems>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "customItems",
  });
  const isFull = fields.length >= INVOICE_MAX_CUSTOM_ITEMS;
  const listError =
    errors.customItems?.root?.message ?? errors.customItems?.message;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Extra lines
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Use a negative unit price to deduct money (e.g. vacant days).
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          startIcon={<PlusIcon />}
          disabled={disabled || isFull}
          onClick={() => append({ ...EMPTY_CUSTOM_ITEM })}
        >
          Add line
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No extra lines.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {fields.map((field, index) => {
            const itemErrors = errors.customItems?.[index];
            return (
              <li
                key={field.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-[minmax(0,1fr)_90px_150px_auto] dark:border-gray-800"
              >
                <div className="col-span-2 sm:col-span-1">
                  <Input
                    placeholder="Description"
                    aria-label={`Line ${index + 1} description`}
                    disabled={disabled}
                    error={!!itemErrors?.description}
                    hint={itemErrors?.description?.message}
                    {...register(`customItems.${index}.description`)}
                  />
                </div>
                <Input
                  placeholder="Qty"
                  inputMode="decimal"
                  aria-label={`Line ${index + 1} quantity`}
                  disabled={disabled}
                  error={!!itemErrors?.quantity}
                  hint={itemErrors?.quantity?.message}
                  {...register(`customItems.${index}.quantity`)}
                />
                <Input
                  placeholder="Unit price"
                  inputMode="decimal"
                  aria-label={`Line ${index + 1} unit price`}
                  disabled={disabled}
                  error={!!itemErrors?.unitPrice}
                  hint={itemErrors?.unitPrice?.message}
                  {...register(`customItems.${index}.unitPrice`)}
                />
                <button
                  type="button"
                  aria-label={`Remove line ${index + 1}`}
                  disabled={disabled}
                  onClick={() => remove(index)}
                  className="hover:text-error-500 flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {listError && <p className="text-error-500 mt-2 text-xs">{listError}</p>}
    </div>
  );
};
