import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/axios";
import { roomsApi } from "./api";
import { roomKeys } from "./queries";
import { CreateRoomPayload, Room, UpdateRoomPayload } from "./types";

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation<Room, ApiError, CreateRoomPayload>({
    mutationFn: (payload) => roomsApi.createRoom(payload),
    onSuccess(data) {
      queryClient.setQueryData(roomKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation<
    Room,
    ApiError,
    { id: string; payload: UpdateRoomPayload }
  >({
    mutationFn: ({ id, payload }) => roomsApi.updateRoom(id, payload),
    onSuccess(data, { id }) {
      queryClient.setQueryData(roomKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => roomsApi.deleteRoom(id),
    onSuccess(_data, id) {
      queryClient.invalidateQueries({
        queryKey: roomKeys.detail(id),
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: roomKeys.lists(),
        refetchType: "none",
      });
    },
  });
}
