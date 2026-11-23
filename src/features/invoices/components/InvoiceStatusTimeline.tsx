"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { useInvoiceStatusHistories } from "@/features/invoices/queries";
import { useActorName } from "@/hooks/useActorName";
import { DateFormat, formatDate } from "@/utils/date";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

interface InvoiceStatusTimelineProps {
  invoiceId: string;
}

export const InvoiceStatusTimeline: React.FC<InvoiceStatusTimelineProps> = ({
  invoiceId,
}) => {
  const actorName = useActorName();
  const {
    data: histories,
    isLoading,
    error,
  } = useInvoiceStatusHistories(invoiceId);

  if (isLoading) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    );
  }

  if (error) return <p className="text-error-500 text-sm">{error.message}</p>;

  if (!histories || histories.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No history yet.
      </p>
    );
  }

  const newestFirst = [...histories].sort((a, b) =>
    b.changedAt.localeCompare(a.changedAt),
  );

  return (
    <ol className="relative ml-2 border-l border-gray-200 dark:border-gray-800">
      {newestFirst.map((history, index) => (
        <li key={history.id} className="relative mb-5 pl-5 last:mb-0">
          <span
            className={`absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-gray-900 ${
              index === 0 ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
          <div className="flex flex-wrap items-center gap-2">
            {history.oldStatus ? (
              <>
                <InvoiceStatusBadge status={history.oldStatus} />
                <ArrowRight
                  className="h-3.5 w-3.5 text-gray-400"
                  aria-label="to"
                />
              </>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Created as
              </span>
            )}
            <InvoiceStatusBadge status={history.newStatus} />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formatDate(history.changedAt, DateFormat.DateTime)} ·{" "}
            {actorName(history.changedBy)}
          </p>
          {history.reason && (
            <p className="mt-1 text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
              {history.reason}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
};
