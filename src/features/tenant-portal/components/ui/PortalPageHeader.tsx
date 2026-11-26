import React from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";

interface PortalPageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  aside?: React.ReactNode;
}

export const PortalPageHeader: React.FC<PortalPageHeaderProps> = ({
  title,
  subtitle,
  backHref,
  backLabel,
  aside,
}) => (
  <div className="mb-4 md:mb-6">
    {backHref && (
      <Link
        href={backHref}
        className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ChevronLeftIcon className="h-5 w-5" aria-hidden />
        {backLabel}
      </Link>
    )}
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {aside}
    </div>
  </div>
);
