export const UtilityReadingRoomStatus = {
  Pending: "pending",
  Partial: "partial",
  Recorded: "recorded",
  NoMeters: "noMeters",
} as const;

export type UtilityReadingRoomStatus =
  (typeof UtilityReadingRoomStatus)[keyof typeof UtilityReadingRoomStatus];

export const READING_MONTH_DEFAULT_SWITCH_DAY = 20;

export const READING_MONTH_LOOKBACK = 12;

export const MeterCellState = {
  Recorded: "recorded",
  Superseded: "superseded",
  First: "first",
  Editable: "editable",
} as const;

export type MeterCellState =
  (typeof MeterCellState)[keyof typeof MeterCellState];
