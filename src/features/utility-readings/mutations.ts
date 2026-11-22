import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpStatus } from "@/enums/httpStatus";
import { ApiError } from "@/lib/axios";
import { utilityReadingsApi } from "./api";
import { utilityReadingKeys } from "./queries";
import {
  RecordRoomUtilityReadingsPayload,
  UtilityReadingRoomMeters,
} from "./types";

export function useRecordRoomUtilityReadings() {
  const queryClient = useQueryClient();

  return useMutation<
    UtilityReadingRoomMeters,
    ApiError,
    { roomId: string; payload: RecordRoomUtilityReadingsPayload }
  >({
    mutationFn: ({ roomId, payload }) =>
      utilityReadingsApi.recordRoomReadings(roomId, payload),
    onSuccess(data, { roomId, payload }) {
      queryClient.invalidateQueries({
        queryKey: utilityReadingKeys.roomMetersAll(),
        refetchType: "none",
      });
      queryClient.setQueryData(
        utilityReadingKeys.roomMeters(roomId, payload.readingMonth),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: utilityReadingKeys.roomLists(),
      });
    },
    onError(error, { roomId, payload }) {
      if (error.status === HttpStatus.Conflict) {
        queryClient.invalidateQueries({
          queryKey: utilityReadingKeys.roomMeters(roomId, payload.readingMonth),
        });
      }
    },
  });
}

export function useDeleteUtilityReading() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { roomId: string; readingId: string }>({
    mutationFn: ({ roomId, readingId }) =>
      utilityReadingsApi.deleteReading(roomId, readingId),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: utilityReadingKeys.all });
    },
    onError(error) {
      if (error.status === HttpStatus.Conflict) {
        queryClient.invalidateQueries({ queryKey: utilityReadingKeys.all });
      }
    },
  });
}
