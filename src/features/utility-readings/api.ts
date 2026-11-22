import { api } from "@/lib/axios";
import {
  GetUtilityReadingRoomsParams,
  GetUtilityReadingRoomsResponse,
  RecordRoomUtilityReadingsPayload,
  UtilityReadingRoomMeters,
} from "./types";

export const utilityReadingsApi = {
  async getRooms(
    propertyId: string,
    params: GetUtilityReadingRoomsParams,
    signal?: AbortSignal,
  ): Promise<GetUtilityReadingRoomsResponse> {
    const res = await api.get<GetUtilityReadingRoomsResponse>(
      `/properties/${propertyId}/utility-readings/rooms`,
      { params, signal },
    );
    return res.data;
  },

  async getRoomMeters(
    roomId: string,
    readingMonth: string,
    signal?: AbortSignal,
  ): Promise<UtilityReadingRoomMeters> {
    const res = await api.get<UtilityReadingRoomMeters>(
      `/rooms/${roomId}/utility-readings/meters`,
      { params: { readingMonth }, signal },
    );
    return res.data;
  },

  async recordRoomReadings(
    roomId: string,
    payload: RecordRoomUtilityReadingsPayload,
  ): Promise<UtilityReadingRoomMeters> {
    const res = await api.post<UtilityReadingRoomMeters>(
      `/rooms/${roomId}/utility-readings`,
      payload,
    );
    return res.data;
  },

  async deleteReading(roomId: string, readingId: string): Promise<void> {
    await api.delete(`/rooms/${roomId}/utility-readings/${readingId}`);
  },
};
