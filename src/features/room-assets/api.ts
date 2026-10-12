import { api } from "@/lib/axios";
import {
  multipartConfig,
  toFormData,
  type UploadProgressHandler,
} from "@/utils/multipart";
import {
  CreateRoomAssetConditionHistoryPayload,
  CreateRoomAssetPayload,
  RoomAsset,
  RoomAssetConditionHistory,
  RoomDetailsAsset,
  SplitRoomAssetPayload,
  SplitRoomAssetResponse,
  UpdateRoomAssetConditionHistoryPayload,
  UpdateRoomAssetPayload,
} from "./types";

export const roomAssetsApi = {
  async createRoomAsset(
    roomId: string,
    payload: CreateRoomAssetPayload,
    onUploadProgress?: UploadProgressHandler,
  ): Promise<RoomDetailsAsset> {
    const formData = toFormData({
      name: payload.name,
      quantity: payload.quantity,
      purchaseDate: payload.purchaseDate || null,
      purchaseUnitPrice: payload.purchaseUnitPrice,
      note: payload.note || null,
      files: payload.files,
    });

    const res = await api.post<RoomDetailsAsset>(
      `/rooms/${roomId}/assets`,
      formData,
      multipartConfig(onUploadProgress),
    );
    return res.data;
  },

  async updateRoomAsset(
    roomId: string,
    assetId: string,
    payload: UpdateRoomAssetPayload,
  ): Promise<RoomAsset> {
    const res = await api.patch<RoomAsset>(
      `/rooms/${roomId}/assets/${assetId}`,
      payload,
    );
    return res.data;
  },

  async deleteRoomAsset(roomId: string, assetId: string): Promise<void> {
    await api.delete(`/rooms/${roomId}/assets/${assetId}`);
  },

  async splitRoomAsset(
    roomId: string,
    assetId: string,
    payload: SplitRoomAssetPayload,
  ): Promise<SplitRoomAssetResponse> {
    const res = await api.post<SplitRoomAssetResponse>(
      `/rooms/${roomId}/assets/${assetId}/split`,
      payload,
    );
    return res.data;
  },

  async getConditionHistories(
    roomId: string,
    assetId: string,
    signal?: AbortSignal,
  ): Promise<RoomAssetConditionHistory[]> {
    const res = await api.get<RoomAssetConditionHistory[]>(
      `/rooms/${roomId}/assets/${assetId}/condition-histories`,
      { signal },
    );
    return res.data;
  },

  async createConditionHistory(
    roomId: string,
    assetId: string,
    payload: CreateRoomAssetConditionHistoryPayload,
    onUploadProgress?: UploadProgressHandler,
  ): Promise<RoomAssetConditionHistory> {
    const formData = toFormData({
      newCondition: payload.newCondition,
      note: payload.note || null,
      files: payload.files,
    });

    const res = await api.post<RoomAssetConditionHistory>(
      `/rooms/${roomId}/assets/${assetId}/condition-histories`,
      formData,
      multipartConfig(onUploadProgress),
    );
    return res.data;
  },

  async updateConditionHistory(
    roomId: string,
    assetId: string,
    historyId: string,
    payload: UpdateRoomAssetConditionHistoryPayload,
    onUploadProgress?: UploadProgressHandler,
  ): Promise<RoomAssetConditionHistory> {
    const formData = toFormData({
      note: payload.note,
      removeMediaIds: payload.removeMediaIds,
      files: payload.files,
    });

    const res = await api.patch<RoomAssetConditionHistory>(
      `/rooms/${roomId}/assets/${assetId}/condition-histories/${historyId}`,
      formData,
      multipartConfig(onUploadProgress),
    );
    return res.data;
  },
};
