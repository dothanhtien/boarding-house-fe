import React, { useMemo } from "react";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import type { LeaseTenant } from "@/features/leases/types";

interface LeaseTenantsSummaryProps {
  tenants: LeaseTenant[];
}

export const LeaseTenantsSummary: React.FC<LeaseTenantsSummaryProps> = ({
  tenants,
}) => {
  const { primary, rest } = useMemo(() => {
    const primary =
      tenants.find((tenant) => tenant.isRepresentative) ?? tenants[0];
    const rest = tenants.filter((tenant) => tenant.id !== primary?.id);
    return { primary, rest };
  }, [tenants]);

  if (!primary) {
    return <span className="text-gray-400 dark:text-gray-500">No tenants</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {primary.fullName}
      {rest.length > 0 && (
        <Tooltip
          content={
            <ul className="space-y-0.5">
              {rest.map((tenant) => (
                <li key={tenant.id}>{tenant.fullName}</li>
              ))}
            </ul>
          }
        >
          <span
            aria-label={rest.map((tenant) => tenant.fullName).join(", ")}
            className="text-theme-xs cursor-default rounded-md bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600 dark:bg-white/5 dark:text-gray-400"
          >
            +{rest.length}
          </span>
        </Tooltip>
      )}
    </span>
  );
};
