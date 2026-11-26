import React from "react";

interface PortalSectionProps {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PortalSection: React.FC<PortalSectionProps> = ({
  title,
  action,
  children,
  className = "",
}) => (
  <section
    className={`rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-white/3 ${className}`}
  >
    {(title || action) && (
      <div className="mb-3 flex items-center justify-between gap-3">
        {title && (
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h2>
        )}
        {action}
      </div>
    )}
    {children}
  </section>
);
