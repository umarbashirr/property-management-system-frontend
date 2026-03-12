import { useState } from "react";
import PhoneInputBase from "react-phone-number-input/input";
import {
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input";
import en from "react-phone-number-input/locale/en";
import type { CountryCode } from "libphonenumber-js";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

// ─── Country options for the combobox ───────────────────────────────────────

const countryPhoneOptions: ComboboxOption[] = getCountries().map(
  (code: CountryCode) => ({
    value: code,
    label: en[code] ?? code,
    meta: `+${getCountryCallingCode(code)}`,
  }),
);

// ─── Component ──────────────────────────────────────────────────────────────

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  defaultCountry?: CountryCode;
}

export function PhoneInput({
  value,
  onChange,
  id,
  placeholder = "Enter phone number",
  disabled = false,
  defaultCountry = "IN",
}: PhoneInputProps) {
  const [country, setCountry] = useState<CountryCode>(defaultCountry);

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      {/* Country selector */}
      <div className="w-30 shrink-0">
        <Combobox
          options={countryPhoneOptions}
          value={country}
          onChange={(v) => setCountry(v as CountryCode)}
          placeholder="Country"
          searchPlaceholder="Search countries…"
          disabled={disabled}
          dropdownWidth={280}
          renderSelected={(option) =>
            option ? (
              <span className="flex items-center gap-1.5 truncate">
                <span>{option.value}</span>
                <span className="text-muted-foreground">{option.meta}</span>
              </span>
            ) : null
          }
        />
      </div>

      {/* Phone number input */}
      <PhoneInputBase
        id={id}
        country={country}
        international
        withCountryCallingCode
        value={value}
        onChange={(v) => onChange(v ?? "")}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow]",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "placeholder:text-muted-foreground",
          "dark:bg-input/30",
        )}
      />
    </div>
  );
}
