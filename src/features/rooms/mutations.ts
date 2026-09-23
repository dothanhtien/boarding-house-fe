import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/axios";
import { roomsApi } from "./api";
import { roomKeys } from "./queries";
import { CreateRoomPayload, Room, UpdateRoomPayload } from "./types";

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation<Room, ApiError, CreateRoomPayload>({
    mutationFn: (payload) => roomsApi.createRoom(payload),
    onSuccess() {
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
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => roomsApi.deleteRoom(id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: roomKeys.lists(),
        refetchType: "none",
      });
    },
  });
}
