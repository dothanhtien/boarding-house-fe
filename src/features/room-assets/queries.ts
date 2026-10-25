import { useQuery } from "@tanstack/react-query";
import { HttpStatus } from "@/enums/httpStatus";
import type { ApiError } from "@/lib/axios";
import { roomAssetsApi } from "./api";
import type { RoomAssetConditionHistory } from "./types";

export const roomAssetKeys = {
  all: ["roomAssets"] as const,
  histories: (assetId: string) =>
    [...roomAssetKeys.all, "histories", assetId] as const,
};

export function useRoomAssetConditionHistories(
  roomId: string,
  assetId: string,
) {
  return useQuery<RoomAssetConditionHistory[], ApiError>({
    queryKey: roomAssetKeys.histories(assetId),
    queryFn: ({ signal }) =>
      roomAssetsApi.getConditionHistories(roomId, assetId, signal),
    retry: (failureCount, error) =>
      error.status !== HttpStatus.NotFound && failureCount < 1,
  });
}
