"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import DatePicker from "@/components/form/DatePicker";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { HttpStatus } from "@/enums/httpStatus";
import { useRecordRoomUtilityReadings } from "@/features/utility-readings/mutations";
import { useUtilityReadingRoomMeters } from "@/features/utility-readings/queries";
import type { UtilityReading } from "@/features/utility-readings/types";
import {
  isDraftFilled,
  useReadingDrafts,
} from "@/features/utility-readings/useReadingDrafts";
import {
  type CellErrors,
  buildMeterCells,
  buildRoomItems,
  formatInvoiceMonth,
  getReadOnRange,
  hasCellErrors,
  isInputState,
  mapItemErrors,
  validateCell,
  validateReadOn,
} from "@/features/utility-readings/utils";
import { fromBillingMonth } from "@/utils/month";
import { getUtcToday } from "@/utils/date";
import { DeleteUtilityReadingDialog } from "./DeleteUtilityReadingDialog";
import { MeterReadingCell } from "./MeterReadingCell";
import { RoomReadingsSummary } from "./RoomReadingsSummary";

interface RoomReadingsModalProps {
  roomId: string;
  readingMonth: string;
  readOn: string;
  onReadOnChange: (readOn: string) => void;
  onClose: () => void;
}

type Banner = {
  variant: "error" | "warning";
  title: string;
  messages: string[];
};

const DISCARD_CONFIRM_MESSAGE =
  "You have unsaved readings. Discard them and continue?";

const readingsLabel = (count: number) =>
  `${count} reading${count === 1 ? "" : "s"}`;

function scrollToFirstError() {
  requestAnimationFrame(() => {
    const input = document.querySelector<HTMLInputElement>(
      '[data-readings-form] input[aria-invalid="true"]',
    );
    input?.scrollIntoView({ block: "center", behavior: "smooth" });
    input?.focus({ preventScroll: true });
  });
}

const BANNER_CLASSES: Record<Banner["variant"], string> = {
  error:
    "border-error-500 bg-error-50 text-error-700 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400",
  warning:
    "border-warning-500 bg-warning-50 text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/15 dark:text-orange-400",
};

const ReadingsBanner: React.FC<{ banner: Banner }> = ({ banner }) => (
  <div
    role="alert"
    className={`rounded-xl border px-4 py-3 text-sm ${BANNER_CLASSES[banner.variant]}`}
  >
    <p className="font-semibold">{banner.title}</p>
    {banner.messages.length > 0 && (
      <ul className="mt-1 list-disc pl-5">
        {banner.messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    )}
  </div>
);

const MeterCellSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-xl bg-gray-50 p-4 dark:bg-white/3">
    <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="mt-4 h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
  </div>
);

export const RoomReadingsModal: React.FC<RoomReadingsModalProps> = ({
  roomId,
  readingMonth,
  readOn,
  onReadOnChange,
  onClose,
}) => {
  const {
    data: room,
    isLoading,
    error: loadError,
  } = useUtilityReadingRoomMeters(roomId, readingMonth);
  const cells = useMemo(() => (room ? buildMeterCells(room) : []), [room]);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState<UtilityReading | null>(null);
  const {
    drafts,
    errors,
    changeCell,
    setCellErrors,
    mergeErrors,
    replaceErrors,
  } = useReadingDrafts();
  const hasUnsavedDrafts = cells.some(
    (cell) => isInputState(cell.state) && isDraftFilled(drafts[cell.key]),
  );
  const recordMutation = useRecordRoomUtilityReadings();
  const isPending = recordMutation.isPending;
  const { items, cellKeys } = buildRoomItems(cells, drafts);
  const { invoice, usage } = formatInvoiceMonth(fromBillingMonth(readingMonth));
  const today = getUtcToday();
  const readOnRange = getReadOnRange(readingMonth, today);
  const readOnError = validateReadOn(readOn, readingMonth, today);

  useEffect(() => {
    if (!hasUnsavedDrafts) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedDrafts]);

  const leave = (navigate: () => void) => {
    if (isPending) return;
    if (hasUnsavedDrafts && !window.confirm(DISCARD_CONFIRM_MESSAGE)) return;
    navigate();
  };

  const handleBlur = (key: string) => {
    const cell = cells.find((c) => c.key === key);
    if (!cell || !isInputState(cell.state)) return;
    setCellErrors(key, validateCell(cell.meter, drafts[key], readOn));
  };

  const handleReadOnChange = (nextReadOn: string) => {
    if (isPending) return;
    onReadOnChange(nextReadOn);
    const revalidated: Record<string, CellErrors> = {};
    for (const cell of cells) {
      if (!isInputState(cell.state) || !(cell.key in errors)) continue;
      revalidated[cell.key] = validateCell(
        cell.meter,
        drafts[cell.key],
        nextReadOn,
      );
    }
    mergeErrors(revalidated);
  };

  const handleSave = () => {
    if (isPending || !room) return;
    setBanner(null);

    const clientErrors: Record<string, CellErrors> = {};
    for (const cell of cells) {
      if (!isInputState(cell.state)) continue;
      const cellErrors = validateCell(cell.meter, drafts[cell.key], readOn);
      if (hasCellErrors(cellErrors)) clientErrors[cell.key] = cellErrors;
    }
    replaceErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      scrollToFirstError();
      return;
    }
    if (items.length === 0 || readOnError) return;

    recordMutation.mutate(
      {
        roomId,
        payload: {
          readingMonth,
          ...(readOn && { readOn }),
          items,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `Room ${room.roomNumber}: saved ${readingsLabel(items.length)}`,
          );
          onClose();
        },
        onError: (saveError) => {
          if (saveError.status === HttpStatus.Conflict) {
            setBanner({
              variant: "warning",
              title:
                "Someone else just recorded readings for this room. It was reloaded",
              messages: ["Your entries are kept. Check them and save again."],
            });
            return;
          }

          if (saveError.status === HttpStatus.BadRequest && saveError.errors) {
            const { cellErrors, generalErrors } = mapItemErrors(
              saveError.errors,
              cellKeys,
            );
            mergeErrors(cellErrors);
            setBanner({
              variant: "error",
              title: "Nothing was saved",
              messages: generalErrors,
            });
            scrollToFirstError();
            return;
          }

          setBanner({
            variant: "error",
            title: "Nothing was saved",
            messages: [saveError.message],
          });
        },
      },
    );
  };

  const canSave = items.length > 0 && !readOnError && !isPending;

  const renderMeters = () => {
    if (loadError) {
      return <p className="text-error-500 text-sm">{loadError.message}</p>;
    }
    if (isLoading || !room) {
      return Array.from({ length: 2 }).map((_, index) => (
        <MeterCellSkeleton key={index} />
      ));
    }
    if (cells.length === 0) {
      return (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This room has no meters to record.
        </p>
      );
    }
    return cells.map((cell) => (
      <MeterReadingCell
        key={cell.key}
        cell={cell}
        draft={drafts[cell.key]}
        errors={errors[cell.key]}
        disabled={isPending}
        onChange={(field, value) => changeCell(cell.key, field, value)}
        onBlur={() => handleBlur(cell.key)}
        onDelete={() => setDeleting(cell.meter.reading)}
      />
    ));
  };

  return (
    <>
      <Modal
        isOpen
        onClose={() => leave(onClose)}
        className="m-4 max-w-[720px]"
        closeOnBackdropClick={false}
      >
        <div className="no-scrollbar relative flex max-h-[90vh] w-full max-w-[720px] flex-col rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
          <div className="mb-5 pr-12">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Meter readings
            </h4>
            {room ? (
              <RoomReadingsSummary room={room} />
            ) : (
              <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            )}
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              Invoice {invoice} · usage {usage}
            </p>
          </div>

          <div
            data-readings-form
            className="custom-scrollbar -mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1"
          >
            <div className="sm:max-w-60">
              <DatePicker
                id="readingReadOn"
                label="Read on"
                placeholder="Today"
                clearable
                disabled={isPending}
                value={readOn}
                minDate={readOnRange.min}
                maxDate={readOnRange.max}
                error={!!readOnError}
                hint={readOnError}
                onChange={(_, dateStr) => handleReadOnChange(dateStr)}
              />
            </div>

            {banner && <ReadingsBanner banner={banner} />}

            {renderMeters()}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => leave(onClose)}
            >
              Close
            </Button>
            <Button type="button" disabled={!canSave} onClick={handleSave}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      {deleting && room && (
        <DeleteUtilityReadingDialog
          roomNumber={room.roomNumber}
          reading={deleting}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
};
