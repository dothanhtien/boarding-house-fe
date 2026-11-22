import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { utilityReadingsApi } from "./api";
import { GetUtilityReadingRoomsParams } from "./types";

export const utilityReadingKeys = {
  all: ["utility-readings"] as const,
  roomLists: () => [...utilityReadingKeys.all, "rooms"] as const,
  roomList: (propertyId: string, params: GetUtilityReadingRoomsParams) =>
    [...utilityReadingKeys.roomLists(), propertyId, params] as const,
  roomMetersAll: () => [...utilityReadingKeys.all, "meters"] as const,
  roomMeters: (roomId: string, readingMonth: string) =>
    [...utilityReadingKeys.roomMetersAll(), roomId, readingMonth] as const,
};

export function useUtilityReadingRooms(
  propertyId: string,
  params: GetUtilityReadingRoomsParams,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: utilityReadingKeys.roomList(propertyId, params),
    queryFn: ({ signal }) =>
      utilityReadingsApi.getRooms(propertyId, params, signal),
    placeholderData: keepPreviousData,
    enabled: (options.enabled ?? true) && !!propertyId,
  });
}

export function useUtilityReadingRoomMeters(
  roomId: string,
  readingMonth: string,
) {
  return useQuery({
    queryKey: utilityReadingKeys.roomMeters(roomId, readingMonth),
    queryFn: ({ signal }) =>
      utilityReadingsApi.getRoomMeters(roomId, readingMonth, signal),
  });
}
