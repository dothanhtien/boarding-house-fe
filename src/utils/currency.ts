interface FormatCurrencyOptions {
  locale?: Intl.LocalesArgument;
  currency?: string;
}

export function formatCurrency(
  amount?: number | null,
  { locale = "vi-VN", currency = "VND" }: FormatCurrencyOptions = {},
) {
  if (amount === undefined || amount === null) return "—";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "code",
  }).format(amount);
}
