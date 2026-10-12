"use client";

import React from "react";
import { ArrowRight, Images, Lock } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import type { ImageViewerItem } from "@/components/ui/image-viewer/ImageViewer";
import type { RoomAssetConditionHistory } from "@/features/room-assets/types";
import { useActorName } from "@/features/room-assets/useActorName";
import { formatDate } from "@/utils/date";
import { AssetConditionBadge } from "./AssetConditionBadge";

interface ConditionHistoryTimelineProps {
  histories: RoomAssetConditionHistory[];
  onViewPhotos: (images: ImageViewerItem[], index: number) => void;
}

export const ConditionHistoryTimeline: React.FC<
  ConditionHistoryTimelineProps
> = ({ histories, onViewPhotos }) => {
  const actorName = useActorName();

  return (
    <ol className="relative ml-2 border-l border-gray-200 dark:border-gray-800">
      {histories.map((history, index) => {
        const isLatest = index === 0;

        return (
          <li key={history.id} className="relative mb-5 pl-5 last:mb-0">
            <span
              className={`absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-gray-900 ${
                isLatest ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />

            <div className="flex flex-wrap items-center gap-2">
              {history.oldCondition ? (
                <>
                  <AssetConditionBadge condition={history.oldCondition} />
                  <ArrowRight
                    className="h-3.5 w-3.5 text-gray-400"
                    aria-label="to"
                  />
                </>
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Added as
                </span>
              )}
              <AssetConditionBadge condition={history.newCondition} />

              <span className="ml-auto flex items-center">
                {isLatest ? (
                  <span className="text-brand-500 text-xs font-medium">
                    Current · editable above
                  </span>
                ) : (
                  <Tooltip content="A newer condition has been recorded, so this entry can't be edited">
                    <span
                      className="flex h-6 w-6 items-center justify-center text-gray-400"
                      aria-label="Locked"
                    >
                      <Lock className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </Tooltip>
                )}
              </span>
            </div>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formatDate(history.changedAt, "YYYY-MM-DD HH:mm")} ·{" "}
              {actorName(history.changedBy)}
              {history.updatedAt && (
                <>
                  {" "}
                  · edited {formatDate(history.updatedAt, "YYYY-MM-DD HH:mm")}
                </>
              )}
            </p>

            {history.note && (
              <p className="mt-1 text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
                {history.note}
              </p>
            )}

            {history.media.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  onViewPhotos(
                    history.media.map((media) => ({
                      url: media.url,
                      alt: media.fileName,
                    })),
                    0,
                  )
                }
                className="text-brand-500 hover:text-brand-600 mt-1.5 inline-flex cursor-pointer items-center gap-1 text-xs font-medium"
              >
                <Images className="h-3.5 w-3.5" aria-hidden />
                {history.media.length} photo
                {history.media.length === 1 ? "" : "s"}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
};
