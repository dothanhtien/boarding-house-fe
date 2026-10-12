export type AssetCondition = "good" | "damaged" | "broken";

export type RoomAssetMedia = {
  mediaId: string;
  url: string;
  mimeType: string;
  fileName: string;
  createdAt: string;
  createdBy: string;
};

export type RoomAssetCurrentPhotos = {
  conditionHistoryId: string;
  condition: AssetCondition;
  changedAt: string;
  isLatest: boolean;
  media: RoomAssetMedia[];
};

export type RoomAsset = {
  id: string;
  roomId: string;
  name: string;
  quantity: number;
  purchaseDate: string | null;
  purchaseUnitPrice: number | null;
  condition: AssetCondition;
  note: string | null;
  splitFromAssetId: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type RoomDetailsAsset = RoomAsset & {
  currentPhotos: RoomAssetCurrentPhotos | null;
};

export type CreateRoomAssetPayload = {
  name: string;
  quantity?: number;
  purchaseDate?: string | null;
  purchaseUnitPrice?: number | null;
  note?: string | null;
  files?: File[];
};

export type UpdateRoomAssetPayload = Partial<{
  name: string;
  quantity: number;
  purchaseDate: string | null;
  purchaseUnitPrice: number | null;
  note: string | null;
}>;

export type SplitRoomAssetPayload = {
  quantity: number;
  newCondition: AssetCondition;
  note?: string | null;
};

export type SplitRoomAssetResponse = {
  original: RoomAsset;
  split: RoomAsset;
};

export type RoomAssetConditionHistory = {
  id: string;
  assetId: string;
  oldCondition: AssetCondition | null;
  newCondition: AssetCondition;
  note: string | null;
  changedBy: string | null;
  changedAt: string;
  updatedAt: string | null;
  updatedBy: string | null;
  media: RoomAssetMedia[];
};

export type CreateRoomAssetConditionHistoryPayload = {
  newCondition: AssetCondition;
  note?: string | null;
  files?: File[];
};

export type UpdateRoomAssetConditionHistoryPayload = {
  note?: string;
  removeMediaIds?: string[];
  files?: File[];
};
