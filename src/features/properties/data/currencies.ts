import type { ComboboxOption } from "@/components/ui/combobox";

/** Common world currencies — INR first for Indian-market default */
const CURRENCY_ENTRIES: [string, string][] = [
  // South Asia first
  ["INR", "Indian Rupee"],
  ["PKR", "Pakistani Rupee"],
  ["BDT", "Bangladeshi Taka"],
  ["LKR", "Sri Lankan Rupee"],
  ["NPR", "Nepalese Rupee"],

  // Major world currencies
  ["USD", "US Dollar"],
  ["EUR", "Euro"],
  ["GBP", "British Pound"],
  ["JPY", "Japanese Yen"],
  ["CNY", "Chinese Yuan"],
  ["CHF", "Swiss Franc"],
  ["CAD", "Canadian Dollar"],
  ["AUD", "Australian Dollar"],
  ["NZD", "New Zealand Dollar"],

  // Middle East
  ["AED", "UAE Dirham"],
  ["SAR", "Saudi Riyal"],
  ["QAR", "Qatari Riyal"],
  ["OMR", "Omani Rial"],
  ["BHD", "Bahraini Dinar"],
  ["KWD", "Kuwaiti Dinar"],

  // Southeast Asia
  ["SGD", "Singapore Dollar"],
  ["MYR", "Malaysian Ringgit"],
  ["THB", "Thai Baht"],
  ["IDR", "Indonesian Rupiah"],
  ["PHP", "Philippine Peso"],
  ["VND", "Vietnamese Dong"],

  // East Asia
  ["KRW", "South Korean Won"],
  ["TWD", "Taiwan Dollar"],
  ["HKD", "Hong Kong Dollar"],

  // Americas
  ["MXN", "Mexican Peso"],
  ["BRL", "Brazilian Real"],
  ["ARS", "Argentine Peso"],
  ["COP", "Colombian Peso"],
  ["CLP", "Chilean Peso"],
  ["PEN", "Peruvian Sol"],

  // Europe
  ["SEK", "Swedish Krona"],
  ["NOK", "Norwegian Krone"],
  ["DKK", "Danish Krone"],
  ["PLN", "Polish Zloty"],
  ["CZK", "Czech Koruna"],
  ["HUF", "Hungarian Forint"],
  ["RUB", "Russian Ruble"],
  ["TRY", "Turkish Lira"],

  // Africa
  ["ZAR", "South African Rand"],
  ["EGP", "Egyptian Pound"],
  ["NGN", "Nigerian Naira"],
  ["KES", "Kenyan Shilling"],
];

export const CURRENCY_OPTIONS: ComboboxOption[] = CURRENCY_ENTRIES.map(
  ([code, name]) => ({
    value: code,
    label: `${code} — ${name}`,
    meta: code,
  }),
);
