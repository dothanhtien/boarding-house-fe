import React from "react";
import Link from "next/link";
import { ROUTES } from "@/config/routeDefinition";
import { InvoiceIssueCode } from "@/features/invoices/constants";
import type { InvoiceIssue } from "@/features/invoices/types";

interface InvoiceIssuesListProps {
  issues: InvoiceIssue[];
  variant: "error" | "warning";
  month: string;
  propertyId: string;
}

const ISSUE_STYLES = {
  error: {
    container:
      "border-error-500/30 bg-error-50 dark:border-error-500/30 dark:bg-error-500/15",
    title: "This invoice can't be created yet:",
  },
  warning: {
    container:
      "border-warning-500/30 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/15",
    title: "Please check:",
  },
} as const;

export const InvoiceIssuesList: React.FC<InvoiceIssuesListProps> = ({
  issues,
  variant,
  month,
  propertyId,
}) => {
  if (issues.length === 0) return null;
  const style = ISSUE_STYLES[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 ${style.container}`}
    >
      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
        {style.title}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-400">
        {issues.map((issue, index) => (
          <li key={`${issue.code}-${issue.serviceId ?? ""}-${index}`}>
            {issue.message}
            {issue.code === InvoiceIssueCode.MissingReading && (
              <>
                {" "}
                <Link
                  href={ROUTES.utilityReadings({ propertyId, month })}
                  className="text-brand-500 hover:text-brand-600 font-medium hover:underline"
                >
                  Record readings
                </Link>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
