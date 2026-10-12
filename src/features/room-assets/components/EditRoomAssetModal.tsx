"use client";

import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Button from "@/components/ui/button/Button";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import { useUpdateRoomAsset } from "@/features/room-assets/mutations";
import {
  updateRoomAssetSchema,
  type UpdateRoomAssetFormValues,
} from "@/features/room-assets/schemas";
import type {
  RoomAsset,
  UpdateRoomAssetPayload,
} from "@/features/room-assets/types";
import { RoomAssetFormFields } from "./RoomAssetFormFields";

interface EditRoomAssetModalProps {
  asset: RoomAsset;
  isOpen: boolean;
  onClose: () => void;
}

const buildDefaultValues = (asset: RoomAsset): UpdateRoomAssetFormValues => ({
  name: asset.name,
  quantity: asset.quantity.toString(),
  purchaseDate: asset.purchaseDate ?? "",
  purchaseUnitPrice: asset.purchaseUnitPrice?.toString() ?? "",
  note: asset.note ?? "",
});

export const EditRoomAssetModal: React.FC<EditRoomAssetModalProps> = ({
  asset,
  isOpen,
  onClose,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const updateRoomAssetMutation = useUpdateRoomAsset();
  const form = useForm<UpdateRoomAssetFormValues>({
    resolver: zodResolver(updateRoomAssetSchema),
    defaultValues: buildDefaultValues(asset),
    mode: "all",
  });
  const {
    handleSubmit,
    setError,
    reset,
    formState: { dirtyFields },
  } = form;

  function handleClose() {
    if (updateRoomAssetMutation.isPending) return;

    reset(buildDefaultValues(asset));
    setGeneralError(null);
    setWarning(null);
    updateRoomAssetMutation.reset();
    onClose();
  }

  function onSubmit(values: UpdateRoomAssetFormValues) {
    setGeneralError(null);
    setWarning(null);

    const payload: UpdateRoomAssetPayload = {};
    if (dirtyFields.name) payload.name = values.name.trim();
    if (dirtyFields.quantity) payload.quantity = Number(values.quantity);
    if (dirtyFields.purchaseDate)
      payload.purchaseDate = values.purchaseDate || null;
    if (dirtyFields.purchaseUnitPrice) {
      payload.purchaseUnitPrice =
        values.purchaseUnitPrice === ""
          ? null
          : Number(values.purchaseUnitPrice);
    }
    if (dirtyFields.note) payload.note = values.note.trim() || null;

    if (Object.keys(payload).length === 0) {
      setWarning("You haven't changed anything yet.");
      return;
    }

    updateRoomAssetMutation.mutate(
      { roomId: asset.roomId, assetId: asset.id, payload },
      {
        onSuccess: () => {
          toast.success("Asset updated successfully");
          handleClose();
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            Object.keys(
              buildDefaultValues(asset),
            ) as (keyof UpdateRoomAssetFormValues)[],
            setError,
            setGeneralError,
          );
        },
      },
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="m-4 max-w-[600px]"
      closeOnBackdropClick={false}
    >
      <div className="no-scrollbar relative flex max-h-[90vh] w-full max-w-[600px] flex-col rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit asset
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Update the asset&apos;s information.
        </p>

        <FormProvider {...form}>
          <Form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1">
              {generalError && (
                <p className="text-error-500 text-sm">{generalError}</p>
              )}

              {warning && <p className="text-warning-500 text-sm">{warning}</p>}

              <RoomAssetFormFields />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateRoomAssetMutation.isPending}
              >
                Cancel
              </Button>
              <Button disabled={updateRoomAssetMutation.isPending}>
                {updateRoomAssetMutation.isPending
                  ? "Saving..."
                  : "Save changes"}
              </Button>
            </div>
          </Form>
        </FormProvider>
      </div>
    </Modal>
  );
};
