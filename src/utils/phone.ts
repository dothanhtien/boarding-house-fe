export function normalizePhone(value: string) {
  const digits = value.trim().replace(/[\s.\-()]/g, "");
  return digits.startsWith("+84") ? `0${digits.slice(3)}` : digits;
}

export const isValidPhone = (normalized: string) => /^0\d{9}$/.test(normalized);
