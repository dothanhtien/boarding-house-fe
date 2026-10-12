"use client";

import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import { Select } from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import {
  ASSET_CONDITION_OPTIONS,
  SPLIT_DEFAULT_CONDITION,
} from "@/features/room-assets/constants";
import { useSplitRoomAsset } from "@/features/room-assets/mutations";
import {
  buildSplitRoomAssetSchema,
  type SplitRoomAssetFormValues,
} from "@/features/room-assets/schemas";
import type { RoomAsset } from "@/features/room-assets/types";

interface SplitRoomAssetModalProps {
  asset: RoomAsset;
  onClose: () => void;
}

export const SplitRoomAssetModal: React.FC<SplitRoomAssetModalProps> = ({
  asset,
  onClose,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const splitRoomAssetMutation = useSplitRoomAsset();
  const schema = useMemo(
    () => buildSplitRoomAssetSchema(asset.quantity, asset.condition),
    [asset.quantity, asset.condition],
  );
  const defaultValues: SplitRoomAssetFormValues = {
    quantity: "1",
    newCondition: SPLIT_DEFAULT_CONDITION[asset.condition],
    note: "",
  };
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<SplitRoomAssetFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "all",
  });

  function handleClose() {
    if (splitRoomAssetMutation.isPending) return;
    onClose();
  }

  function onSubmit(values: SplitRoomAssetFormValues) {
    setGeneralError(null);

    splitRoomAssetMutation.mutate(
      {
        roomId: asset.roomId,
        assetId: asset.id,
        payload: {
          quantity: Number(values.quantity),
          newCondition: values.newCondition,
          note: values.note.trim() || null,
        },
      },
      {
        onSuccess: ({ split }) => {
          toast.success(
            `Split ${split.quantity} × ${asset.name} into a separate row`,
          );
          onClose();
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            Object.keys(defaultValues) as (keyof SplitRoomAssetFormValues)[],
            setError,
            setGeneralError,
          );
        },
      },
    );
  }

  return (
    <Modal
      isOpen
      onClose={handleClose}
      className="m-4 max-w-[520px]"
      closeOnBackdropClick={false}
    >
      <div className="relative flex max-h-[90vh] w-full flex-col rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Split asset
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Move some of the{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {asset.quantity} × {asset.name}
          </span>{" "}
          into a separate row with its own condition, e.g. when 1 of 4 chairs is
          damaged.
        </p>

        {asset.quantity < 2 ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This asset has a quantity of 1, so it can&apos;t be split. Record
              a new condition instead.
            </p>
            <div className="mt-6 flex justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </>
        ) : (
          <Form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1">
              {generalError && (
                <p className="text-error-500 text-sm">{generalError}</p>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="quantity">
                    Quantity to split <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={asset.quantity - 1}
                    error={!!errors.quantity}
                    hint={
                      errors.quantity?.message ?? `1 – ${asset.quantity - 1}`
                    }
                    {...register("quantity")}
                  />
                </div>
                <div>
                  <Label htmlFor="newCondition">
                    New condition <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="newCondition"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="newCondition"
                        options={ASSET_CONDITION_OPTIONS.filter(
                          (option) => option.value !== asset.condition,
                        )}
                        placeholder="Select a condition"
                        value={field.value}
                        error={!!errors.newCondition}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.newCondition && (
                    <p className="text-error-500 mt-1.5 text-sm">
                      {errors.newCondition.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="note">Note</Label>
                <Controller
                  name="note"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      id="note"
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.note}
                      hint={errors.note?.message}
                    />
                  )}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={splitRoomAssetMutation.isPending}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button disabled={splitRoomAssetMutation.isPending}>
                {splitRoomAssetMutation.isPending ? "Splitting..." : "Split"}
              </Button>
            </div>
          </Form>
        )}
      </div>
    </Modal>
  );
};
