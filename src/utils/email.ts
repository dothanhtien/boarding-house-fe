export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const isValidEmail = (normalized: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
