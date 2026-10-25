export const toOptionalNumber = (value: string) =>
  value === "" ? undefined : Number(value);
