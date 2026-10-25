"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { Package, Plus } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { ImageViewer } from "@/components/ui/image-viewer/ImageViewer";
import type { RoomDetailsAsset } from "@/features/room-assets/types";
import { formatCurrency } from "@/utils/currency";
import { AssetConditionBadge } from "./AssetConditionBadge";
import { CreateRoomAssetModal } from "./CreateRoomAssetModal";
import { DeleteRoomAssetDialog } from "./DeleteRoomAssetDialog";
import { EditRoomAssetModal } from "./EditRoomAssetModal";
import { RecordConditionModal } from "./RecordConditionModal";
import { RoomAssetDetailDrawer } from "./RoomAssetDetailDrawer";
import {
  RoomAssetActionsMenu,
  type RoomAssetAction,
} from "./RoomAssetActionsMenu";
import { SplitRoomAssetModal } from "./SplitRoomAssetModal";

const ROW_GRID = "md:grid-cols-[minmax(0,1fr)_80px_160px_96px_36px] md:gap-y-0";

const AssetCell: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="min-w-0">
    <p className="text-xs text-gray-500 md:hidden dark:text-gray-400">
      {label}
    </p>
    <p className="truncate text-sm text-gray-800 dark:text-white/90">
      {children}
    </p>
  </div>
);

interface RoomAssetsSectionProps {
  roomId: string;
  assets: RoomDetailsAsset[];
}

type OpenDialog =
  | { type: Exclude<RoomAssetAction, "view">; assetId: string }
  | { type: "photos"; assetId: string };

export const RoomAssetsSection: React.FC<RoomAssetsSectionProps> = ({
  roomId,
  assets,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [drawerAssetId, setDrawerAssetId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<OpenDialog | null>(null);

  const findAsset = (id: string | null | undefined) =>
    id ? assets.find((asset) => asset.id === id) : undefined;
  const drawerAsset = findAsset(drawerAssetId);
  const dialogAsset = findAsset(dialog?.assetId);
  const closeDrawer = useCallback(() => setDrawerAssetId(null), []);
  const closeDialog = () => setDialog(null);

  function handleAction(asset: RoomDetailsAsset, action: RoomAssetAction) {
    if (action === "view") setDrawerAssetId(asset.id);
    else setDialog({ type: action, assetId: asset.id });
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="mb-5 flex items-center justify-between gap-3 lg:mb-6">
        <div className="flex items-center gap-3">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Assets
          </h4>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({assets.length})
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          startIcon={<Plus className="h-4 w-4" aria-hidden />}
          onClick={() => setIsCreating(true)}
        >
          Add asset
        </Button>
      </div>

      {assets.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No assets.</p>
      ) : (
        <div>
          <div
            className={`${ROW_GRID} hidden gap-x-4 px-4 pb-2 text-xs font-medium text-gray-500 md:grid dark:text-gray-400`}
          >
            <span>Asset</span>
            <span>Quantity</span>
            <span>Unit price</span>
            <span>Condition</span>
            <span className="sr-only">Actions</span>
          </div>

          <ul className="flex flex-col gap-3">
            {assets.map((asset) => {
              const photos = asset.currentPhotos?.media ?? [];
              const thumbnail = photos[0];
              const splitFrom = asset.splitFromAssetId
                ? findAsset(asset.splitFromAssetId)
                : undefined;

              return (
                <li
                  key={asset.id}
                  className={`${ROW_GRID} grid grid-cols-3 items-center gap-x-4 gap-y-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-800`}
                >
                  <div className="col-span-3 flex min-w-0 items-center gap-3 md:col-span-1">
                    {thumbnail ? (
                      <button
                        type="button"
                        onClick={() =>
                          setDialog({ type: "photos", assetId: asset.id })
                        }
                        aria-label={`View photos of ${asset.name}`}
                        className="focus-visible:ring-brand-500/40 relative h-12 w-12 shrink-0 cursor-zoom-in overflow-hidden rounded-md bg-gray-100 transition hover:opacity-80 focus-visible:ring-3 focus-visible:outline-hidden dark:bg-gray-800"
                      >
                        <Image
                          src={thumbnail.url}
                          alt={asset.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        {photos.length > 1 && (
                          <span className="absolute right-0.5 bottom-0.5 rounded bg-gray-900/70 px-1 text-[10px] leading-4 text-white">
                            +{photos.length - 1}
                          </span>
                        )}
                      </button>
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                        <Package
                          className="h-5 w-5 text-gray-400 dark:text-gray-500"
                          aria-hidden
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => setDrawerAssetId(asset.id)}
                        className="text-brand-500 hover:text-brand-600 block max-w-full cursor-pointer truncate text-left text-sm font-medium"
                      >
                        {asset.name}
                      </button>
                      {asset.splitFromAssetId && (
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          Split from {splitFrom?.name ?? "a deleted asset"}
                        </p>
                      )}
                      {asset.note && (
                        <p
                          className="truncate text-xs text-gray-500 dark:text-gray-400"
                          title={asset.note}
                        >
                          {asset.note}
                        </p>
                      )}
                    </div>
                    <span className="md:hidden">
                      <AssetConditionBadge condition={asset.condition} />
                    </span>
                    <div className="md:hidden">
                      <RoomAssetActionsMenu
                        assetName={asset.name}
                        canSplit={asset.quantity > 1}
                        onAction={(action) => handleAction(asset, action)}
                      />
                    </div>
                  </div>

                  <AssetCell label="Quantity">{asset.quantity}</AssetCell>
                  <AssetCell label="Unit price">
                    {formatCurrency(asset.purchaseUnitPrice)}
                  </AssetCell>
                  <div className="hidden md:block">
                    <AssetConditionBadge condition={asset.condition} />
                  </div>
                  <div className="hidden md:block">
                    <RoomAssetActionsMenu
                      assetName={asset.name}
                      canSplit={asset.quantity > 1}
                      onAction={(action) => handleAction(asset, action)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <CreateRoomAssetModal
        roomId={roomId}
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
      />

      {drawerAsset && (
        <RoomAssetDetailDrawer
          asset={drawerAsset}
          splitFromName={findAsset(drawerAsset.splitFromAssetId)?.name}
          onClose={closeDrawer}
        />
      )}

      {dialogAsset && dialog?.type === "edit" && (
        <EditRoomAssetModal asset={dialogAsset} isOpen onClose={closeDialog} />
      )}
      {dialogAsset && dialog?.type === "record" && (
        <RecordConditionModal asset={dialogAsset} onClose={closeDialog} />
      )}
      {dialogAsset && dialog?.type === "split" && (
        <SplitRoomAssetModal asset={dialogAsset} onClose={closeDialog} />
      )}
      {dialogAsset && dialog?.type === "delete" && (
        <DeleteRoomAssetDialog
          asset={dialogAsset}
          onClose={closeDialog}
          onDeleted={closeDrawer}
        />
      )}
      {dialogAsset?.currentPhotos && dialog?.type === "photos" && (
        <ImageViewer
          title={dialogAsset.name}
          images={dialogAsset.currentPhotos.media.map((media) => ({
            url: media.url,
            alt: media.fileName,
          }))}
          onClose={closeDialog}
        />
      )}
    </div>
  );
};
