"use client";

import React, { useRef, useState } from "react";
import { HttpStatus } from "@/enums/httpStatus";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Undo2, X } from "lucide-react";
import { ImageFilePreview } from "@/components/form/ImageFilePreview";
import TextArea from "@/components/form/input/TextArea";
import { useObjectUrls } from "@/hooks/useObjectUrls";
import Button from "@/components/ui/button/Button";
import type { ImageViewerItem } from "@/components/ui/image-viewer/ImageViewer";
import {
  MEDIA_ALLOWED_IMAGE_MIME_TYPES,
  MEDIA_MAX_FILES_PER_REQUEST,
} from "@/config/media";
import { MAX_PHOTOS_PER_CONDITION_ENTRY } from "@/features/room-assets/constants";
import { useUpdateRoomAssetConditionHistory } from "@/features/room-assets/mutations";
import { imageFilesSchema } from "@/features/room-assets/schemas";
import type {
  RoomAssetConditionHistory,
  UpdateRoomAssetConditionHistoryPayload,
} from "@/features/room-assets/types";
import { formatSavingLabel } from "@/features/room-assets/utils";
import { DateFormat, formatDate } from "@/utils/date";
import { AssetConditionBadge } from "./AssetConditionBadge";

interface CurrentConditionEditorProps {
  roomId: string;
  history: RoomAssetConditionHistory;
  onViewPhotos: (images: ImageViewerItem[], index: number) => void;
}

export const CurrentConditionEditor: React.FC<CurrentConditionEditorProps> = ({
  roomId,
  history,
  onViewPhotos,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [note, setNote] = useState(history.note ?? "");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const updateHistoryMutation = useUpdateRoomAssetConditionHistory();
  const isSaving = updateHistoryMutation.isPending;

  const newPreviews = useObjectUrls(newFiles);

  const keptCount = history.media.length - removedIds.size;
  const totalCount = keptCount + newFiles.length;
  const isAtEntryLimit = totalCount >= MAX_PHOTOS_PER_CONDITION_ENTRY;
  const isAtRequestLimit = newFiles.length >= MEDIA_MAX_FILES_PER_REQUEST;
  const canAdd = !isSaving && !isAtEntryLimit && !isAtRequestLimit;
  const noteChanged = note.trim() !== (history.note ?? "");
  const isDirty = removedIds.size > 0 || newFiles.length > 0 || noteChanged;
  const fileValidation = imageFilesSchema.safeParse(newFiles);
  const fileError = fileValidation.success
    ? null
    : fileValidation.error.issues[0]?.message;

  function toggleRemoved(mediaId: string) {
    setRemovedIds((current) => {
      const next = new Set(current);
      if (next.has(mediaId)) next.delete(mediaId);
      else next.add(mediaId);
      return next;
    });
  }

  function handleFilesPicked(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    const slots = Math.min(
      MAX_PHOTOS_PER_CONDITION_ENTRY - totalCount,
      MEDIA_MAX_FILES_PER_REQUEST - newFiles.length,
    );
    if (picked.length > slots) {
      toast.warning(
        `Only ${slots} more photo${slots === 1 ? "" : "s"} can be added; extra files were skipped.`,
      );
    }
    setNewFiles((current) => [...current, ...picked.slice(0, slots)]);
  }

  function discardChanges() {
    setRemovedIds(new Set());
    setNewFiles([]);
    setNote(history.note ?? "");
    updateHistoryMutation.reset();
  }

  function save() {
    if (isSaving || !isDirty || fileError) return;
    setUploadProgress(null);

    const payload: UpdateRoomAssetConditionHistoryPayload = {};
    if (removedIds.size > 0) payload.removeMediaIds = [...removedIds];
    if (newFiles.length > 0) payload.files = newFiles;
    if (noteChanged) payload.note = note.trim();

    updateHistoryMutation.mutate(
      {
        roomId,
        assetId: history.assetId,
        historyId: history.id,
        payload,
        onUploadProgress: newFiles.length > 0 ? setUploadProgress : undefined,
      },
      {
        onSuccess: () => toast.success("Condition photos updated successfully"),
        onError: (error) => {
          if (error.status === HttpStatus.Conflict) {
            toast.error(
              "A newer condition was recorded in the meantime, so this entry can no longer be edited. The history has been refreshed.",
            );
          }
        },
      },
    );
  }

  const viewerImages: ImageViewerItem[] = history.media.map((media) => ({
    url: media.url,
    alt: media.fileName,
  }));

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h5 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Current condition
        </h5>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {totalCount} / {MAX_PHOTOS_PER_CONDITION_ENTRY} photos
        </span>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <AssetConditionBadge condition={history.newCondition} />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          since {formatDate(history.changedAt, DateFormat.DateTime)}
        </span>
      </div>

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {history.media.map((media, index) => {
          const isRemoved = removedIds.has(media.mediaId);
          return (
            <li
              key={media.mediaId}
              className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
            >
              <button
                type="button"
                onClick={() => onViewPhotos(viewerImages, index)}
                disabled={isRemoved}
                aria-label={`View ${media.fileName}`}
                className="block h-full w-full cursor-zoom-in disabled:cursor-default"
              >
                <Image
                  src={media.url}
                  alt={media.fileName}
                  fill
                  unoptimized
                  className={`object-cover transition ${isRemoved ? "opacity-30 grayscale" : ""}`}
                />
              </button>
              {isRemoved && (
                <span className="text-error-600 pointer-events-none absolute inset-x-0 bottom-1 text-center text-[11px] font-medium">
                  Will be removed
                </span>
              )}
              <button
                type="button"
                onClick={() => toggleRemoved(media.mediaId)}
                disabled={isSaving}
                aria-label={
                  isRemoved
                    ? `Undo removing ${media.fileName}`
                    : `Remove ${media.fileName}`
                }
                title={isRemoved ? "Undo" : "Remove"}
                className="absolute top-1 right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-gray-900/60 text-white transition hover:bg-gray-900/80"
              >
                {isRemoved ? (
                  <Undo2 className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <X className="h-3.5 w-3.5" aria-hidden />
                )}
              </button>
            </li>
          );
        })}

        {newFiles.map((file, index) => (
          <ImageFilePreview
            key={`${file.name}-${file.lastModified}-${index}`}
            file={file}
            src={newPreviews[index]}
            onRemove={() =>
              setNewFiles((current) => current.filter((_, i) => i !== index))
            }
            disabled={isSaving}
            className="border-brand-300 dark:border-brand-700 border-2 border-dashed"
            badge={
              <span className="bg-brand-500 pointer-events-none absolute bottom-1 left-1 rounded px-1 text-[10px] leading-4 text-white">
                New
              </span>
            }
          />
        ))}

        <li className="aspect-square">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canAdd}
            title={
              isAtEntryLimit
                ? `An entry can have at most ${MAX_PHOTOS_PER_CONDITION_ENTRY} photos`
                : isAtRequestLimit
                  ? `At most ${MEDIA_MAX_FILES_PER_REQUEST} new photos per save`
                  : "Add photos"
            }
            className="hover:border-brand-500 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-gray-500 transition disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
          >
            <ImagePlus className="h-5 w-5" aria-hidden />
            <span className="text-xs">Add</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={MEDIA_ALLOWED_IMAGE_MIME_TYPES.join(",")}
            className="hidden"
            onChange={handleFilesPicked}
          />
        </li>
      </ul>

      {fileError && <p className="text-error-500 mt-2 text-xs">{fileError}</p>}

      <div className="mt-4">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">
          Note
        </p>
        <TextArea
          value={note}
          onChange={setNote}
          disabled={isSaving}
          rows={2}
          placeholder="Add a note about this condition"
        />
      </div>

      {updateHistoryMutation.error &&
        updateHistoryMutation.error.status !== HttpStatus.Conflict && (
          <p className="text-error-500 mt-2 text-sm">
            {updateHistoryMutation.error.message}
          </p>
        )}

      {isDirty && (
        <div className="mt-4 flex items-center justify-end gap-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isSaving}
            onClick={discardChanges}
          >
            Discard
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSaving || !!fileError}
            onClick={save}
          >
            {isSaving
              ? formatSavingLabel("Saving", uploadProgress)
              : "Save photo changes"}
          </Button>
        </div>
      )}
    </section>
  );
};
