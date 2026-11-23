"use client";

import React from "react";
import type { InvoicePreview } from "@/features/invoices/types";
import { DateFormat, formatDate } from "@/utils/date";
import { fromBillingMonth } from "@/utils/month";
import { InvoiceIssuesList } from "./InvoiceIssuesList";
import { InvoiceLinesTable } from "./InvoiceLinesTable";
import { InvoiceTotals } from "./InvoiceTotals";

interface InvoicePreviewPanelProps {
  preview: InvoicePreview | undefined;
  isUpdating: boolean;
  error: string | null;
  isWaitingForInput: boolean;
}

export const InvoicePreviewPanel: React.FC<InvoicePreviewPanelProps> = ({
  preview,
  isUpdating,
  error,
  isWaitingForInput,
}) => (
  <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Preview
      </h4>
      {isUpdating && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Updating…
        </span>
      )}
    </div>

    {error && <p className="text-error-500 mb-4 text-sm">{error}</p>}

    {!preview ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {isWaitingForInput
          ? "Pick a lease and a month, and fix any form errors, to see the invoice."
          : !error && "Loading preview…"}
      </p>
    ) : (
      <div
        className={`flex flex-col gap-5 transition-opacity ${
          isUpdating ? "opacity-60" : ""
        }`}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Room {preview.roomNumber} · {preview.propertyName} · Lease{" "}
          {preview.leaseCode}
        </p>

        <InvoiceIssuesList
          issues={preview.errors}
          variant="error"
          month={fromBillingMonth(preview.billingMonth)}
          propertyId={preview.propertyId}
        />
        <InvoiceIssuesList
          issues={preview.warnings}
          variant="warning"
          month={fromBillingMonth(preview.billingMonth)}
          propertyId={preview.propertyId}
        />

        <InvoiceLinesTable lines={preview.items} />

        <InvoiceTotals {...preview} />

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Due date:{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {formatDate(preview.dueDate, DateFormat.Date)}
          </span>
        </p>
      </div>
    )}
  </div>
);
