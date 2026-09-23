import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { roomsApi } from "./api";
import { GetRoomsParams } from "./types";

export const roomKeys = {
  all: ["rooms"] as const,
  lists: () => [...roomKeys.all, "list"] as const,
  list: (params: GetRoomsParams) => [...roomKeys.lists(), params] as const,
  detail: (id: string) => [...roomKeys.all, "detail", id] as const,
};

export function useRooms(params: GetRoomsParams) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: ({ signal }) => roomsApi.getRooms(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: ({ signal }) => roomsApi.getRoom(id, signal),
  });
}
