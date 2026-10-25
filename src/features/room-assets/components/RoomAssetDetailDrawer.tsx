"use client";

import React, { useEffect, useState } from "react";
import { HttpStatus } from "@/enums/httpStatus";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardPlus, SquarePen } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { Drawer } from "@/components/ui/drawer/Drawer";
import {
  ImageViewer,
  type ImageViewerItem,
} from "@/components/ui/image-viewer/ImageViewer";
import { InfoItem } from "@/components/ui/info-item/InfoItem";
import { roomKeys } from "@/features/rooms/queries";
import { useRoomAssetConditionHistories } from "@/features/room-assets/queries";
import type { RoomDetailsAsset } from "@/features/room-assets/types";
import { formatCurrency } from "@/utils/currency";
import { DateFormat, formatDate } from "@/utils/date";
import { AssetConditionBadge } from "./AssetConditionBadge";
import { ConditionHistoryTimeline } from "./ConditionHistoryTimeline";
import { CurrentConditionEditor } from "./CurrentConditionEditor";
import { EditRoomAssetModal } from "./EditRoomAssetModal";
import { RecordConditionModal } from "./RecordConditionModal";

interface RoomAssetDetailDrawerProps {
  asset: RoomDetailsAsset;
  splitFromName?: string;
  onClose: () => void;
}

export const RoomAssetDetailDrawer: React.FC<RoomAssetDetailDrawerProps> = ({
  asset,
  splitFromName,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [viewer, setViewer] = useState<{
    images: ImageViewerItem[];
    index: number;
  } | null>(null);
  const {
    data: histories,
    isLoading,
    error,
  } = useRoomAssetConditionHistories(asset.roomId, asset.id);

  useEffect(() => {
    if (error?.status !== HttpStatus.NotFound) return;
    toast.error("This asset no longer exists.");
    queryClient.invalidateQueries({ queryKey: roomKeys.detail(asset.roomId) });
    onClose();
  }, [error, asset.roomId, queryClient, onClose]);

  const latest = histories?.[0];

  return (
    <>
      <Drawer
        isOpen
        onClose={onClose}
        title={
          <div className="flex min-w-0 items-center gap-3">
            <h4 className="truncate text-lg font-semibold text-gray-800 dark:text-white/90">
              {asset.name}
            </h4>
            <AssetConditionBadge condition={asset.condition} />
          </div>
        }
      >
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h5 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Information
              </h5>
              <Button
                type="button"
                size="sm"
                variant="outline"
                startIcon={<SquarePen className="h-4 w-4" aria-hidden />}
                onClick={() => setIsEditing(true)}
              >
                Edit info
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Quantity" value={asset.quantity} />
              <InfoItem
                label="Unit price"
                value={formatCurrency(asset.purchaseUnitPrice)}
              />
              <InfoItem
                label="Purchase date"
                value={formatDate(asset.purchaseDate, DateFormat.Date)}
              />
              <InfoItem label="Added" value={formatDate(asset.createdAt)} />
              {asset.splitFromAssetId && (
                <InfoItem
                  label="Split from"
                  value={splitFromName ?? "A deleted asset"}
                />
              )}
            </div>
            {asset.note && (
              <div className="mt-4">
                <InfoItem
                  label="Note"
                  value={
                    <span className="whitespace-pre-line">{asset.note}</span>
                  }
                />
              </div>
            )}
          </section>

          <div className="border-t border-gray-200 pt-6 dark:border-gray-800">
            {isLoading && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading condition history...
              </p>
            )}
            {error && error.status !== HttpStatus.NotFound && (
              <p className="text-error-500 text-sm">{error.message}</p>
            )}
            {latest && (
              <CurrentConditionEditor
                key={`${latest.id}-${latest.updatedAt ?? ""}`}
                roomId={asset.roomId}
                history={latest}
                onViewPhotos={(images, index) => setViewer({ images, index })}
              />
            )}
            <div className="mt-5">
              <Button
                type="button"
                size="sm"
                className="w-full"
                startIcon={<ClipboardPlus className="h-4 w-4" aria-hidden />}
                onClick={() => setIsRecording(true)}
              >
                Record new condition
              </Button>
            </div>
          </div>

          {histories && histories.length > 0 && (
            <section className="border-t border-gray-200 pt-6 dark:border-gray-800">
              <h5 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
                History
              </h5>
              <ConditionHistoryTimeline
                histories={histories}
                onViewPhotos={(images, index) => setViewer({ images, index })}
              />
            </section>
          )}
        </div>
      </Drawer>

      {isEditing && (
        <EditRoomAssetModal
          asset={asset}
          isOpen
          onClose={() => setIsEditing(false)}
        />
      )}

      {isRecording && (
        <RecordConditionModal
          asset={asset}
          onClose={() => setIsRecording(false)}
        />
      )}

      {viewer && (
        <ImageViewer
          title={asset.name}
          images={viewer.images}
          initialIndex={viewer.index}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
};
