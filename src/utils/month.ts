import dayjs, { type Dayjs } from "dayjs";
import "@/utils/date";

export const MonthFormat = {
  Value: "YYYY-MM",
  Display: "MM/YYYY",
} as const;

export const toBillingMonth = (month: string) => `${month}-01`;

export const fromBillingMonth = (billingMonth: string) =>
  billingMonth.slice(0, 7);

export const isMonthValue = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

export const getCurrentUtcMonth = () => dayjs.utc().format(MonthFormat.Value);

export const getCurrentLocalMonth = () => dayjs().format(MonthFormat.Value);

export const formatMonth = (month: string) =>
  dayjs(toBillingMonth(fromBillingMonth(month))).format(MonthFormat.Display);

export type MonthOption = { value: string; label: string };

export function getMonthOptions({
  today,
  lookback,
  formatLabel = formatMonth,
}: {
  today: Dayjs;
  lookback: number;
  formatLabel?: (month: string) => string;
}): MonthOption[] {
  return Array.from({ length: lookback + 2 }, (_, i) => {
    const value = today.add(1 - i, "month").format(MonthFormat.Value);
    return { value, label: formatLabel(value) };
  });
}
