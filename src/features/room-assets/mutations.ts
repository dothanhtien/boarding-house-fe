import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ApiError } from "@/lib/axios";
import type { UploadProgressHandler } from "@/utils/multipart";
import { roomKeys } from "@/features/rooms/queries";
import type { RoomDetails } from "@/features/rooms/types";
import { roomAssetsApi } from "./api";
import { roomAssetKeys } from "./queries";
import {
  CreateRoomAssetConditionHistoryPayload,
  CreateRoomAssetPayload,
  RoomAsset,
  RoomAssetConditionHistory,
  RoomAssetCurrentPhotos,
  RoomDetailsAsset,
  SplitRoomAssetPayload,
  SplitRoomAssetResponse,
  UpdateRoomAssetConditionHistoryPayload,
  UpdateRoomAssetPayload,
} from "./types";

type AssetTarget = { roomId: string; assetId: string };

function updateCachedRoomAssets(
  queryClient: QueryClient,
  roomId: string,
  updater: (assets: RoomDetailsAsset[]) => RoomDetailsAsset[],
) {
  queryClient.setQueryData<RoomDetails>(roomKeys.detail(roomId), (room) =>
    room ? { ...room, assets: updater(room.assets) } : room,
  );
}

function patchCachedRoomAsset(
  queryClient: QueryClient,
  roomId: string,
  assetId: string,
  patch: Partial<RoomDetailsAsset>,
) {
  updateCachedRoomAssets(queryClient, roomId, (assets) =>
    assets.map((asset) =>
      asset.id === assetId ? { ...asset, ...patch } : asset,
    ),
  );
}

function mergeRoomAsset(
  asset: RoomAsset,
  existing?: RoomDetailsAsset,
): RoomDetailsAsset {
  return { ...asset, currentPhotos: existing?.currentPhotos ?? null };
}

function deriveCurrentPhotos(
  histories: RoomAssetConditionHistory[],
): RoomAssetCurrentPhotos | null {
  const index = histories.findIndex((history) => history.media.length > 0);
  if (index === -1) return null;

  const history = histories[index];
  return {
    conditionHistoryId: history.id,
    condition: history.newCondition,
    changedAt: history.changedAt,
    isLatest: index === 0,
    media: history.media,
  };
}

function useRefetchRoomOnNotFound() {
  const queryClient = useQueryClient();

  return (error: ApiError, roomId: string) => {
    if (error.status === 404) {
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
    }
  };
}

export function useCreateRoomAsset() {
  const queryClient = useQueryClient();
  const refetchRoomOnNotFound = useRefetchRoomOnNotFound();

  return useMutation<
    RoomDetailsAsset,
    ApiError,
    {
      roomId: string;
      payload: CreateRoomAssetPayload;
      onUploadProgress?: UploadProgressHandler;
    }
  >({
    mutationFn: ({ roomId, payload, onUploadProgress }) =>
      roomAssetsApi.createRoomAsset(roomId, payload, onUploadProgress),
    onSuccess(data, { roomId }) {
      updateCachedRoomAssets(queryClient, roomId, (assets) => [
        ...assets,
        data,
      ]);
    },
    onError(error, { roomId }) {
      refetchRoomOnNotFound(error, roomId);
    },
  });
}

export function useUpdateRoomAsset() {
  const queryClient = useQueryClient();
  const refetchRoomOnNotFound = useRefetchRoomOnNotFound();

  return useMutation<
    RoomAsset,
    ApiError,
    AssetTarget & { payload: UpdateRoomAssetPayload }
  >({
    mutationFn: ({ roomId, assetId, payload }) =>
      roomAssetsApi.updateRoomAsset(roomId, assetId, payload),
    onSuccess(data, { roomId }) {
      updateCachedRoomAssets(queryClient, roomId, (assets) =>
        assets.map((asset) =>
          asset.id === data.id ? mergeRoomAsset(data, asset) : asset,
        ),
      );
    },
    onError(error, { roomId }) {
      refetchRoomOnNotFound(error, roomId);
    },
  });
}

export function useDeleteRoomAsset() {
  const queryClient = useQueryClient();
  const refetchRoomOnNotFound = useRefetchRoomOnNotFound();

  return useMutation<void, ApiError, AssetTarget>({
    mutationFn: ({ roomId, assetId }) =>
      roomAssetsApi.deleteRoomAsset(roomId, assetId),
    onSuccess(_data, { roomId, assetId }) {
      updateCachedRoomAssets(queryClient, roomId, (assets) =>
        assets.filter((asset) => asset.id !== assetId),
      );
      queryClient.removeQueries({
        queryKey: roomAssetKeys.histories(assetId),
      });
    },
    onError(error, { roomId }) {
      refetchRoomOnNotFound(error, roomId);
    },
  });
}

export function useSplitRoomAsset() {
  const queryClient = useQueryClient();
  const refetchRoomOnNotFound = useRefetchRoomOnNotFound();

  return useMutation<
    SplitRoomAssetResponse,
    ApiError,
    AssetTarget & { payload: SplitRoomAssetPayload }
  >({
    mutationFn: ({ roomId, assetId, payload }) =>
      roomAssetsApi.splitRoomAsset(roomId, assetId, payload),
    onSuccess({ original, split }, { roomId }) {
      updateCachedRoomAssets(queryClient, roomId, (assets) => {
        const next = assets.map((asset) =>
          asset.id === original.id ? mergeRoomAsset(original, asset) : asset,
        );
        const originalIndex = next.findIndex((a) => a.id === original.id);
        if (originalIndex === -1) next.push(mergeRoomAsset(split));
        else next.splice(originalIndex + 1, 0, mergeRoomAsset(split));
        return next;
      });
    },
    onError(error, { roomId }) {
      refetchRoomOnNotFound(error, roomId);
    },
  });
}

function syncAssetFromHistories(
  queryClient: QueryClient,
  roomId: string,
  assetId: string,
  histories: RoomAssetConditionHistory[],
) {
  const latest = histories[0];
  if (!latest) return;

  patchCachedRoomAsset(queryClient, roomId, assetId, {
    condition: latest.newCondition,
    currentPhotos: deriveCurrentPhotos(histories),
  });
}

export function useCreateRoomAssetConditionHistory() {
  const queryClient = useQueryClient();
  const refetchRoomOnNotFound = useRefetchRoomOnNotFound();

  return useMutation<
    RoomAssetConditionHistory,
    ApiError,
    AssetTarget & {
      payload: CreateRoomAssetConditionHistoryPayload;
      onUploadProgress?: UploadProgressHandler;
    }
  >({
    mutationFn: ({ roomId, assetId, payload, onUploadProgress }) =>
      roomAssetsApi.createConditionHistory(
        roomId,
        assetId,
        payload,
        onUploadProgress,
      ),
    onSuccess(data, { roomId, assetId }) {
      const histories = queryClient.setQueryData<RoomAssetConditionHistory[]>(
        roomAssetKeys.histories(assetId),
        (current) => (current ? [data, ...current] : current),
      );

      if (histories) {
        syncAssetFromHistories(queryClient, roomId, assetId, histories);
        return;
      }

      const room = queryClient.getQueryData<RoomDetails>(
        roomKeys.detail(roomId),
      );
      const existing = room?.assets.find((asset) => asset.id === assetId);
      patchCachedRoomAsset(queryClient, roomId, assetId, {
        condition: data.newCondition,
        currentPhotos:
          data.media.length > 0
            ? deriveCurrentPhotos([data])
            : existing?.currentPhotos
              ? { ...existing.currentPhotos, isLatest: false }
              : null,
      });
    },
    onError(error, { roomId }) {
      refetchRoomOnNotFound(error, roomId);
    },
  });
}

export function useUpdateRoomAssetConditionHistory() {
  const queryClient = useQueryClient();
  const refetchRoomOnNotFound = useRefetchRoomOnNotFound();

  return useMutation<
    RoomAssetConditionHistory,
    ApiError,
    AssetTarget & {
      historyId: string;
      payload: UpdateRoomAssetConditionHistoryPayload;
      onUploadProgress?: UploadProgressHandler;
    }
  >({
    mutationFn: ({ roomId, assetId, historyId, payload, onUploadProgress }) =>
      roomAssetsApi.updateConditionHistory(
        roomId,
        assetId,
        historyId,
        payload,
        onUploadProgress,
      ),
    onSuccess(data, { roomId, assetId }) {
      const histories = queryClient.setQueryData<RoomAssetConditionHistory[]>(
        roomAssetKeys.histories(assetId),
        (current) =>
          current?.map((history) => (history.id === data.id ? data : history)),
      );
      if (histories) {
        syncAssetFromHistories(queryClient, roomId, assetId, histories);
      }
    },
    onError(error, { roomId, assetId }) {
      if (error.status === 409) {
        queryClient.invalidateQueries({
          queryKey: roomAssetKeys.histories(assetId),
        });
        queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
      }
      refetchRoomOnNotFound(error, roomId);
    },
  });
}
