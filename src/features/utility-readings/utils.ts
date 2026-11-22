import dayjs from "dayjs";
import { DateFormat } from "@/utils/date";
import {
  MeterCellState,
  READING_MONTH_DEFAULT_SWITCH_DAY,
  READING_MONTH_LOOKBACK,
  UtilityReadingRoomStatus,
} from "./constants";
import type {
  RecordUtilityReadingItem,
  UtilityReadingRoomListItem,
  UtilityReadingRoomMeter,
  UtilityReadingRoomMeters,
} from "./types";

const MONTH_FORMAT = "YYYY-MM";

export const toReadingMonth = (month: string) => `${month}-01`;
export const fromReadingMonth = (readingMonth: string) =>
  readingMonth.slice(0, 7);

export const isMonthValue = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

const utcNow = () => dayjs.utc();

export const getCurrentReadingMonth = () => utcNow().format(MONTH_FORMAT);

export function getDefaultReadingMonth(today = utcNow()) {
  const month =
    today.date() >= READING_MONTH_DEFAULT_SWITCH_DAY
      ? today.add(1, "month")
      : today;
  return month.format(MONTH_FORMAT);
}

export function formatInvoiceMonth(month: string) {
  const invoiceMonth = dayjs(toReadingMonth(month));
  return {
    invoice: invoiceMonth.format("MM/YYYY"),
    usage: invoiceMonth.subtract(1, "month").format("MM/YYYY"),
  };
}

export function getReadingMonthOptions(today = utcNow()) {
  return Array.from({ length: READING_MONTH_LOOKBACK + 2 }, (_, i) => {
    const value = today.add(1 - i, "month").format(MONTH_FORMAT);
    const { invoice, usage } = formatInvoiceMonth(value);
    return { value, label: `Invoice ${invoice} · usage ${usage}` };
  });
}

export const isSelectableReadingMonth = (month: string, today = utcNow()) =>
  getReadingMonthOptions(today).some((option) => option.value === month);

export function getReadOnRange(readingMonth: string, today: string) {
  const month = dayjs(readingMonth);
  const lastDay = month.endOf("month").format(DateFormat.Date);
  return {
    min: month.subtract(1, "month").format(DateFormat.Date),
    max: lastDay < today ? lastDay : today,
  };
}

export function validateReadOn(
  readOn: string,
  readingMonth: string,
  today: string,
): string | undefined {
  const { min, max } = getReadOnRange(readingMonth, today);
  const date = readOn || today;
  if (date >= min && date <= max) return undefined;
  return readOn
    ? `Pick a date from ${min} to ${max}`
    : `Today is outside this billing month, pick a date from ${min} to ${max}`;
}

export function parseMeterValue(input: string): number | undefined {
  const value = input.trim().replace(",", ".");
  if (value === "") return undefined;
  return /^\d+(\.\d*)?$/.test(value) ? Number(value) : NaN;
}

const meterValueFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
  useGrouping: false,
});

export function formatMeterValue(value: number | null | undefined) {
  return value === null || value === undefined
    ? "—"
    : meterValueFormatter.format(value);
}

export const cellKey = (roomId: string, serviceId: string) =>
  `${roomId}:${serviceId}`;

export function getMeterCellState(
  meter: UtilityReadingRoomMeter,
  readingMonth: string,
): MeterCellState {
  if (meter.reading) return MeterCellState.Recorded;
  if (!meter.latest) return MeterCellState.First;
  if (meter.latest.readingMonth > readingMonth) {
    return MeterCellState.Superseded;
  }
  return MeterCellState.Editable;
}

export const isInputState = (state: MeterCellState) =>
  state === MeterCellState.First || state === MeterCellState.Editable;

export const canDeleteReading = (meter: UtilityReadingRoomMeter) =>
  !!meter.reading &&
  meter.latest?.id === meter.reading.id &&
  !meter.reading.invoiceId;

export const computeUsage = (current: number, previous: number) =>
  Math.round((current - previous) * 100) / 100;

export const computeAmount = (usage: number, unitPrice: number) =>
  Math.round(usage * unitPrice);

export type MeterCell = {
  key: string;
  meter: UtilityReadingRoomMeter;
  state: MeterCellState;
};

export const buildMeterCells = (room: UtilityReadingRoomMeters): MeterCell[] =>
  room.meters.map((meter) => ({
    key: cellKey(room.roomId, meter.serviceId),
    meter,
    state: getMeterCellState(meter, room.readingMonth),
  }));

export const isRoomDone = (room: UtilityReadingRoomListItem) =>
  room.status === UtilityReadingRoomStatus.Recorded ||
  room.status === UtilityReadingRoomStatus.NoMeters;

export type CellDraft = { currentValue: string; previousValue: string };

export type CellErrors = {
  row?: string;
  currentValue?: string;
  previousValue?: string;
};

export const hasCellErrors = (errors: CellErrors | undefined) =>
  !!errors && Object.values(errors).some(Boolean);

const MAX_INTEGER_DIGITS = 13;

function validateMeterNumber(input: string): {
  value?: number;
  error?: string;
} {
  const value = parseMeterValue(input);
  if (value === undefined) return {};
  if (Number.isNaN(value)) return { error: "Enter a valid number" };

  const [integerPart, fractionPart = ""] = input
    .trim()
    .replace(",", ".")
    .split(".");
  if (fractionPart.length > 2) {
    return { error: "Use at most 2 decimal places" };
  }
  if (integerPart.replace(/^0+(?=\d)/, "").length > MAX_INTEGER_DIGITS) {
    return { error: "The value is too large" };
  }
  return { value };
}

export function validateCell(
  meter: UtilityReadingRoomMeter,
  draft: CellDraft | undefined,
  readOn: string,
): CellErrors {
  if (!draft) return {};

  const errors: CellErrors = {};
  const current = validateMeterNumber(draft.currentValue);
  const start = meter.latest
    ? {}
    : validateMeterNumber(draft.previousValue ?? "");

  if (current.error) errors.currentValue = current.error;
  if (start.error) errors.previousValue = start.error;
  if (errors.currentValue || errors.previousValue) return errors;

  if (current.value === undefined) {
    if (start.value !== undefined) {
      errors.currentValue = "Enter the current value";
    }
    return errors;
  }

  if (meter.latest) {
    if (current.value < meter.latest.currentValue) {
      errors.currentValue = `Must be at least ${formatMeterValue(meter.latest.currentValue)}`;
    }
    if (readOn && meter.latest.readOn > readOn) {
      errors.row = `A later reading (${meter.latest.readOn}) already exists`;
    }
  } else if (start.value !== undefined && start.value > current.value) {
    errors.previousValue = "Can't be greater than the current value";
  }

  return errors;
}

export function buildRoomItems(
  cells: MeterCell[],
  drafts: Record<string, CellDraft>,
) {
  const items: RecordUtilityReadingItem[] = [];
  const cellKeys: string[] = [];

  for (const { key, meter, state } of cells) {
    const draft = drafts[key];
    if (!draft || !isInputState(state)) continue;

    const currentValue = parseMeterValue(draft.currentValue);
    if (currentValue === undefined) continue;

    const previousValue =
      state === MeterCellState.First
        ? parseMeterValue(draft.previousValue)
        : undefined;

    items.push({
      serviceId: meter.serviceId,
      currentValue,
      ...(previousValue !== undefined && { previousValue }),
    });
    cellKeys.push(key);
  }

  return { items, cellKeys };
}

const ITEM_ERROR_KEY = /^items\[(\d+)\](?:\.(\w+))?$/i;

export function mapItemErrors(
  errors: Record<string, string[]>,
  cellKeys: string[],
) {
  const cellErrors: Record<string, CellErrors> = {};
  const generalErrors: string[] = [];

  for (const [key, messages] of Object.entries(errors)) {
    const message = messages[0];
    if (!message) continue;

    const match = ITEM_ERROR_KEY.exec(key);
    const target = match ? cellKeys[Number(match[1])] : undefined;
    if (!match || !target) {
      generalErrors.push(message);
      continue;
    }

    const field = match[2]?.toLowerCase();
    const slot: keyof CellErrors =
      field === "currentvalue"
        ? "currentValue"
        : field === "previousvalue"
          ? "previousValue"
          : "row";
    cellErrors[target] = { ...cellErrors[target], [slot]: message };
  }

  return { cellErrors, generalErrors };
}
