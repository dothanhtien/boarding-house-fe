import dayjs from "dayjs";

export const DateFormat = {
  Date: "YYYY-MM-DD",
  DateTime: "YYYY-MM-DD HH:mm",
  DateTimeWithSeconds: "YYYY-MM-DD HH:mm:ss",
} as const;

const DEFAULT_PLACEHOLDER = "—";

export function formatDate(
  value: string | null,
  format: string = DateFormat.DateTimeWithSeconds,
  placeholder: string = DEFAULT_PLACEHOLDER,
) {
  return value ? dayjs(value).format(format) : placeholder;
}
