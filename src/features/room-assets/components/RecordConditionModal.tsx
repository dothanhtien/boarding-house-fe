"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import { Select } from "@/components/form/Select";
import { ImageFilesInput } from "@/components/form/ImageFilesInput";
import Button from "@/components/ui/button/Button";
import {
  MEDIA_ALLOWED_IMAGE_MIME_TYPES,
  MEDIA_MAX_FILE_SIZE_BYTES,
  MEDIA_MAX_FILES_PER_REQUEST,
} from "@/config/media";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";
import { ASSET_CONDITION_OPTIONS } from "@/features/room-assets/constants";
import { useCreateRoomAssetConditionHistory } from "@/features/room-assets/mutations";
import {
  recordConditionSchema,
  type RecordConditionFormInput,
  type RecordConditionFormValues,
} from "@/features/room-assets/schemas";
import type { AssetCondition, RoomAsset } from "@/features/room-assets/types";
import { formatSavingLabel } from "@/features/room-assets/utils";

interface RecordConditionModalProps {
  asset: RoomAsset;
  onClose: () => void;
}

const DEFAULT_VALUES: RecordConditionFormInput = {
  newCondition: "",
  note: "",
  files: [],
};

export const RecordConditionModal: React.FC<RecordConditionModalProps> = ({
  asset,
  onClose,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const createHistoryMutation = useCreateRoomAssetConditionHistory();
  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<RecordConditionFormInput, unknown, RecordConditionFormValues>({
    resolver: zodResolver(recordConditionSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "all",
  });

  function handleClose() {
    if (createHistoryMutation.isPending) return;
    onClose();
  }

  function onSubmit(values: RecordConditionFormValues) {
    setGeneralError(null);
    setUploadProgress(null);

    createHistoryMutation.mutate(
      {
        roomId: asset.roomId,
        assetId: asset.id,
        onUploadProgress:
          values.files.length > 0 ? setUploadProgress : undefined,
        payload: {
          // The schema rejects "", so this is always a real condition here.
          newCondition: values.newCondition as AssetCondition,
          note: values.note.trim() || null,
          files: values.files,
        },
      },
      {
        onSuccess: () => {
          toast.success("Condition recorded successfully");
          onClose();
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(
            error,
            Object.keys(DEFAULT_VALUES) as (keyof RecordConditionFormInput)[],
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
      className="m-4 max-w-[600px]"
      closeOnBackdropClick={false}
    >
      <div className="no-scrollbar relative flex max-h-[90vh] w-full flex-col rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Record new condition
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Adds a new entry to{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {asset.name}
          </span>
          &apos;s condition history. Earlier entries become read-only.
        </p>

        <Form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1">
            {generalError && (
              <p className="text-error-500 text-sm">{generalError}</p>
            )}

            <div>
              <Label htmlFor="newCondition">
                Condition <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="newCondition"
                control={control}
                render={({ field }) => (
                  <Select
                    id="newCondition"
                    options={ASSET_CONDITION_OPTIONS}
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

            <div>
              <Label htmlFor="files">Photos</Label>
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
                    disabled={createHistoryMutation.isPending}
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
              disabled={createHistoryMutation.isPending}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button disabled={createHistoryMutation.isPending}>
              {createHistoryMutation.isPending
                ? formatSavingLabel("Saving", uploadProgress)
                : "Record condition"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
