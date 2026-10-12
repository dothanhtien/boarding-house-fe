import { api } from "@/lib/axios";
import {
  CreateRoomPayload,
  GetRoomsParams,
  GetRoomsResponse,
  RoomDetails,
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

  async getRoom(id: string, signal?: AbortSignal): Promise<RoomDetails> {
    const res = await api.get<RoomDetails>(`/rooms/${id}`, { signal });
    return res.data;
  },

  async createRoom(payload: CreateRoomPayload): Promise<RoomDetails> {
    const res = await api.post<RoomDetails>("/rooms", payload);
    return res.data;
  },

  async updateRoom(
    id: string,
    payload: UpdateRoomPayload,
  ): Promise<RoomDetails> {
    const res = await api.patch<RoomDetails>(`/rooms/${id}`, payload);
    return res.data;
  },

  async deleteRoom(id: string): Promise<void> {
    await api.delete(`/rooms/${id}`);
  },
};
