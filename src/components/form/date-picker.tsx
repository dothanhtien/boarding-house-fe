import { useEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import { X } from "lucide-react";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  onBlur?: () => void;
  defaultDate?: DateOption;
  value?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  hint?: string;
  clearable?: boolean;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  onBlur,
  label,
  defaultDate,
  value,
  placeholder,
  disabled = false,
  error = false,
  hint,
  clearable = false,
}: PropsType) {
  const inputRef = useRef<HTMLInputElement>(null);
  const instanceRef = useRef<flatpickr.Instance | null>(null);
  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);
  const initialDateRef = useRef(value ?? defaultDate);
  const [hasValue, setHasValue] = useState(() => !!(value ?? defaultDate));
  const showClear =
    clearable && !disabled && (value !== undefined ? !!value : hasValue);

  function clear() {
    instanceRef.current?.clear();
    onBlurRef.current?.();
  }

  useEffect(() => {
    onChangeRef.current = onChange;
    onBlurRef.current = onBlur;
  });

  useEffect(() => {
    if (!inputRef.current) return;

    const reposition = () => instanceRef.current?._positionCalendar();

    const instance = flatpickr(inputRef.current, {
      mode: mode || "single",
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate: initialDateRef.current || undefined,
      onChange: (selectedDates, ...rest) => {
        setHasValue(selectedDates.length > 0);
        const handler = onChangeRef.current;
        if (Array.isArray(handler))
          handler.forEach((h) => h(selectedDates, ...rest));
        else handler?.(selectedDates, ...rest);
      },
      onOpen: () => {
        document.addEventListener("scroll", reposition, true);
        window.addEventListener("resize", reposition);
      },
      onClose: () => {
        document.removeEventListener("scroll", reposition, true);
        window.removeEventListener("resize", reposition);
        onBlurRef.current?.();
      },
    });
    instanceRef.current = instance;

    return () => {
      document.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      instance.destroy();
      instanceRef.current = null;
    };
  }, [mode]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || value === undefined) return;
    if (value === instance.input.value) return;

    if (value) instance.setDate(value, false);
    else instance.clear(false);
  }, [value]);

  let inputClasses =
    "shadow-theme-xs h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

  if (disabled) {
    inputClasses +=
      " cursor-not-allowed border-gray-300 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400";
  } else if (error) {
    inputClasses +=
      " border-error-500 text-error-800 focus:ring-error-500/10 dark:border-error-500 dark:text-error-400";
  } else {
    inputClasses +=
      " focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 border-gray-300 bg-transparent text-gray-800 dark:border-gray-700";
  }

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
        />

        {showClear ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear date"
            className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <CalenderIcon className="size-6" />
          </span>
        )}
      </div>

      {hint && (
        <p
          className={`mt-1.5 text-xs ${error ? "text-error-500" : "text-gray-500"}`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
