import dayjs from "dayjs";

const DEFAULT_FORMAT = "YYYY-MM-DD HH:mm:ss";
const DEFAULT_PLACEHOLDER = "—";

export function formatDate(
  value: string | null,
  format: string = DEFAULT_FORMAT,
  placeholder: string = DEFAULT_PLACEHOLDER,
) {
  return value ? dayjs(value).format(format) : placeholder;
}
