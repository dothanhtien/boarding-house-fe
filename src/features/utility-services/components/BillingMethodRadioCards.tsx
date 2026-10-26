import React from "react";
import {
  UTILITY_BILLING_METHOD_OPTIONS,
  type UtilityBillingMethod,
} from "@/features/utility-services/constants";

interface BillingMethodRadioCardsProps {
  name: string;
  value: UtilityBillingMethod | "";
  onChange: (value: UtilityBillingMethod) => void;
  onBlur?: () => void;
  error?: boolean;
  disabled?: boolean;
}

export const BillingMethodRadioCards: React.FC<
  BillingMethodRadioCardsProps
> = ({ name, value, onChange, onBlur, error = false, disabled = false }) => (
  <div
    role="radiogroup"
    aria-invalid={error}
    className="grid grid-cols-1 gap-3 sm:grid-cols-3"
  >
    {UTILITY_BILLING_METHOD_OPTIONS.map((option) => {
      const isChecked = option.value === value;
      return (
        <label
          key={option.value}
          className={`flex cursor-pointer flex-col gap-1 rounded-lg border px-4 py-3 transition has-focus-visible:ring-3 ${
            isChecked
              ? "border-brand-500 bg-brand-50 ring-brand-500/20 dark:bg-brand-500/10"
              : error
                ? "border-error-500 ring-error-500/10"
                : "ring-brand-500/10 border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={isChecked}
            disabled={disabled}
            onChange={() => onChange(option.value)}
            onBlur={onBlur}
            className="sr-only"
          />
          <span
            className={`text-sm font-medium ${
              isChecked
                ? "text-brand-500 dark:text-brand-400"
                : "text-gray-800 dark:text-white/90"
            }`}
          >
            {option.label}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {option.description}
          </span>
        </label>
      );
    })}
  </div>
);
