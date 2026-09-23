import { api } from "@/lib/axios";
import {
  CreateRoomPayload,
  GetRoomsParams,
  GetRoomsResponse,
  Room,
  UpdateRoomPayload,
} from "./types";

export const roomsApi = {
  async getRooms(
    params: GetRoomsParams,
    signal?: AbortSignal,
  ): Promise<GetRoomsResponse> {
    const res = await api.get<GetRoomsResponse>("/rooms", { params, signal });
    return res.data;
  },

  async createRoom(payload: CreateRoomPayload): Promise<Room> {
    const res = await api.post<Room>("/rooms", payload);
    return res.data;
  },

  async updateRoom(id: string, payload: UpdateRoomPayload): Promise<Room> {
    const res = await api.patch<Room>(`/rooms/${id}`, payload);
    return res.data;
  },

  async deleteRoom(id: string): Promise<void> {
    await api.delete(`/rooms/${id}`);
  },
};
