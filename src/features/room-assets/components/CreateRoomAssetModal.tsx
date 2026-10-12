"use client";

import React, { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import { ImageFilesInput } from "@/components/form/ImageFilesInput";
import Button from "@/components/ui/button/Button";
import {
  MEDIA_ALLOWED_IMAGE_MIME_TYPES,
  MEDIA_MAX_FILE_SIZE_BYTES,
  MEDIA_MAX_FILES_PER_REQUEST,
} from "@/config/media";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import { useCreateRoomAsset } from "@/features/room-assets/mutations";
import {
  createRoomAssetSchema,
  type CreateRoomAssetFormValues,
} from "@/features/room-assets/schemas";
import { formatSavingLabel } from "@/features/room-assets/utils";
import { RoomAssetFormFields } from "./RoomAssetFormFields";

interface CreateRoomAssetModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_VALUES: CreateRoomAssetFormValues = {
  name: "",
  quantity: "1",
  purchaseDate: "",
  purchaseUnitPrice: "",
  note: "",
  files: [],
};

export const CreateRoomAssetModal: React.FC<CreateRoomAssetModalProps> = ({
  roomId,
  isOpen,
  onClose,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const createRoomAssetMutation = useCreateRoomAsset();
  const form = useForm<CreateRoomAssetFormValues>({
    resolver: zodResolver(createRoomAssetSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "all",
  });
  const {
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors },
  } = form;

  function handleClose() {
    if (createRoomAssetMutation.isPending) return;

    reset(DEFAULT_VALUES);
    setGeneralError(null);
    setUploadProgress(null);
    createRoomAssetMutation.reset();
    onClose();
  }

  function onSubmit(values: CreateRoomAssetFormValues) {
    setGeneralError(null);
    setUploadProgress(null);

    createRoomAssetMutation.mutate(
      {
        roomId,
        onUploadProgress:
          values.files.length > 0 ? setUploadProgress : undefined,
        payload: {
          name: values.name.trim(),
          quantity: Number(values.quantity),
          purchaseDate: values.purchaseDate || null,
          purchaseUnitPrice:
            values.purchaseUnitPrice === ""
              ? null
              : Number(values.purchaseUnitPrice),
          note: values.note.trim() || null,
          files: values.files,
        },
      },
      {
        onSuccess: () => {
          toast.success("Asset added successfully");
          handleClose();
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            Object.keys(DEFAULT_VALUES) as (keyof CreateRoomAssetFormValues)[],
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
          Add asset
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Record a piece of furniture or equipment in this room. New assets
          start in good condition.
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

              <RoomAssetFormFields />

              <div>
                <Label htmlFor="files">Condition photos</Label>
                <p className="-mt-1 mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Baseline photos used to compare against when the tenant moves
                  out.
                </p>
                <Controller
                  name="files"
                  control={control}
                  render={({ field }) => (
                    <ImageFilesInput
                      id="files"
                      value={field.value}
                      onChange={field.onChange}
                      accept={MEDIA_ALLOWED_IMAGE_MIME_TYPES}
                      maxFiles={MEDIA_MAX_FILES_PER_REQUEST}
                      maxSizeBytes={MEDIA_MAX_FILE_SIZE_BYTES}
                      disabled={createRoomAssetMutation.isPending}
                      error={!!errors.files}
                      hint={errors.files?.message}
                    />
                  )}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={createRoomAssetMutation.isPending}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button disabled={createRoomAssetMutation.isPending}>
                {createRoomAssetMutation.isPending
                  ? formatSavingLabel("Adding", uploadProgress)
                  : "Add asset"}
              </Button>
            </div>
          </Form>
        </FormProvider>
      </div>
    </Modal>
  );
};
