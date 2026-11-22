import React from "react";
import { Trash2 } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { MeterCellState } from "@/features/utility-readings/constants";
import {
  type CellDraft,
  type CellErrors,
  type MeterCell,
  canDeleteReading,
  computeAmount,
  computeUsage,
  formatMeterValue,
  fromReadingMonth,
  parseMeterValue,
} from "@/features/utility-readings/utils";
import { formatCurrency } from "@/utils/currency";

export interface MeterReadingCellProps {
  cell: MeterCell;
  draft?: CellDraft;
  errors?: CellErrors;
  disabled?: boolean;
  onChange: (field: keyof CellDraft, value: string) => void;
  onBlur: () => void;
  onDelete: () => void;
}

const isValidNumber = (value: number | undefined): value is number =>
  value !== undefined && !Number.isNaN(value);

function getUsage({ meter, state }: MeterCell, draft?: CellDraft) {
  if (state === MeterCellState.Recorded) return meter.reading!.consumption;
  if (state === MeterCellState.Superseded || !draft) return null;

  const current = parseMeterValue(draft.currentValue);
  const previous =
    state === MeterCellState.Editable
      ? meter.latest!.currentValue
      : parseMeterValue(draft.previousValue);
  if (!isValidNumber(current) || !isValidNumber(previous)) return null;

  const usage = computeUsage(current, previous);
  return usage >= 0 ? usage : null;
}

function focusNextInput(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key !== "Enter") return;
  event.preventDefault();

  const container = event.currentTarget.closest("[data-readings-form]");
  const inputs = Array.from(
    container?.querySelectorAll<HTMLInputElement>(
      "input[data-meter-input]:not(:disabled)",
    ) ?? [],
  );
  const next = inputs[inputs.indexOf(event.currentTarget) + 1];
  next?.focus();
  next?.select();
}

interface MeterInputProps {
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}

const MeterInput: React.FC<MeterInputProps> = ({
  label,
  value,
  error,
  placeholder,
  disabled = false,
  onChange,
  onBlur,
}) => (
  <input
    type="text"
    inputMode="decimal"
    autoComplete="off"
    data-meter-input
    aria-label={label}
    aria-invalid={!!error}
    value={value}
    placeholder={placeholder}
    disabled={disabled}
    onChange={(event) => onChange(event.target.value)}
    onBlur={onBlur}
    onKeyDown={focusNextInput}
    className={`shadow-theme-xs h-12 w-full rounded-lg border bg-white px-3 text-base tabular-nums placeholder:text-gray-400 focus:ring-3 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-60 md:h-10 md:text-sm dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
      error
        ? "border-error-500 text-error-800 focus:ring-error-500/10 dark:border-error-500 dark:text-error-400"
        : "focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 border-gray-300 text-gray-800 dark:border-gray-700"
    }`}
  />
);

const ErrorText: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="text-error-500 mt-1 text-xs">{message}</p> : null;

const FieldLabel: React.FC<{ children: React.ReactNode; end?: boolean }> = ({
  children,
  end = false,
}) => (
  <span
    className={`text-theme-xs font-medium text-gray-500 dark:text-gray-400 ${end ? "text-end" : ""}`}
  >
    {children}
  </span>
);

const ValueBox: React.FC<{ children: React.ReactNode; end?: boolean }> = ({
  children,
  end = false,
}) => (
  <div
    className={`flex h-12 items-center text-sm tabular-nums md:h-10 ${end ? "justify-end" : ""}`}
  >
    {children}
  </div>
);

const UsageValue: React.FC<{ cell: MeterCell; usage: number | null }> = ({
  cell: { meter },
  usage,
}) => (
  <div className="text-end">
    <ValueBox end>
      <span className="font-semibold text-gray-800 dark:text-white/90">
        {usage === null ? "—" : `${formatMeterValue(usage)} ${meter.unit}`}
      </span>
    </ValueBox>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      {meter.effectiveUnitPrice === null
        ? "Not billed"
        : usage === null
          ? ""
          : `≈ ${formatCurrency(computeAmount(usage, meter.effectiveUnitPrice))} est.`}
    </p>
  </div>
);

const RecordedActions: React.FC<{
  cell: MeterCell;
  disabled: boolean;
  onDelete: () => void;
}> = ({ cell, disabled, onDelete }) => (
  <div className="flex items-center gap-0.5">
    <Badge size="sm" color="success">
      Recorded
    </Badge>
    {canDeleteReading(cell.meter) && (
      <button
        type="button"
        aria-label={`Delete ${cell.meter.serviceName} reading`}
        disabled={disabled}
        onClick={onDelete}
        className="hover:text-error-500 dark:hover:text-error-500 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-400"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    )}
  </div>
);

function getPreviousValue({ meter, state }: MeterCell) {
  if (state === MeterCellState.Recorded) return meter.reading!.previousValue;
  if (state === MeterCellState.Superseded) return null;
  return meter.latest?.currentValue ?? null;
}

export const MeterReadingCell: React.FC<MeterReadingCellProps> = ({
  cell,
  draft,
  errors,
  disabled = false,
  onChange,
  onBlur,
  onDelete,
}) => {
  const { meter, state } = cell;
  const usage = getUsage(cell, draft);

  const previousValue =
    state === MeterCellState.First ? (
      <>
        <MeterInput
          label={`${meter.serviceName} start value`}
          value={draft?.previousValue ?? ""}
          error={errors?.previousValue}
          placeholder="Optional"
          disabled={disabled}
          onChange={(value) => onChange("previousValue", value)}
          onBlur={onBlur}
        />
        <ErrorText message={errors?.previousValue} />
      </>
    ) : (
      <ValueBox>
        <span className="text-gray-500 dark:text-gray-400">
          {formatMeterValue(getPreviousValue(cell))}
        </span>
      </ValueBox>
    );

  const currentValue =
    state === MeterCellState.Recorded ? (
      <ValueBox>
        <span className="font-semibold text-gray-800 dark:text-white/90">
          {formatMeterValue(meter.reading!.currentValue)}
        </span>
      </ValueBox>
    ) : state === MeterCellState.Superseded ? (
      <ValueBox>
        <span className="text-gray-500 dark:text-gray-400">
          {formatMeterValue(null)}
        </span>
      </ValueBox>
    ) : (
      <>
        <MeterInput
          label={`${meter.serviceName} current value`}
          value={draft?.currentValue ?? ""}
          error={errors?.currentValue ?? errors?.row}
          placeholder="Enter reading"
          disabled={disabled}
          onChange={(value) => onChange("currentValue", value)}
          onBlur={onBlur}
        />
        <ErrorText message={errors?.currentValue} />
        <ErrorText message={errors?.row} />
      </>
    );

  return (
    <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/3">
      <div className="mb-3 flex min-h-8 items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {meter.serviceName}{" "}
          <span className="font-normal text-gray-500 dark:text-gray-400">
            · {meter.unit}
          </span>
        </h4>
        {state === MeterCellState.Recorded && (
          <RecordedActions
            cell={cell}
            disabled={disabled}
            onDelete={onDelete}
          />
        )}
        {state === MeterCellState.First && (
          <Badge size="sm" color="info">
            New meter
          </Badge>
        )}
        {state === MeterCellState.Superseded && (
          <Badge size="sm" color="light">
            Locked
          </Badge>
        )}
      </div>

      {state === MeterCellState.Superseded && (
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          A later month ({fromReadingMonth(meter.latest!.readingMonth)}) has
          already been recorded.
        </p>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] items-start gap-x-3 gap-y-1">
        <FieldLabel>
          {state === MeterCellState.First ? "Start value" : "Previous"}
        </FieldLabel>
        <FieldLabel>Current</FieldLabel>
        <FieldLabel end>Usage</FieldLabel>
        <div>{previousValue}</div>
        <div>{currentValue}</div>
        <UsageValue cell={cell} usage={usage} />
      </div>
    </div>
  );
};
