import React from "react";
import { SquarePen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Switch from "@/components/form/switch/Switch";
import {
  SortableDataTable,
  type SortableColumn,
} from "@/components/ui/table/SortableDataTable";
import { UTILITY_BILLING_METHOD_LABELS } from "@/features/utility-services/constants";
import { useUpdateUtilityService } from "@/features/utility-services/mutations";
import type { UtilityService } from "@/features/utility-services/types";
import { formatUnitPrice } from "@/features/utility-services/utils";
import { UtilityTypeIcon } from "./UtilityTypeIcon";

interface UtilityServicesTableProps {
  services: UtilityService[];
  isLoading: boolean;
  isFetching?: boolean;
  hasError?: boolean;
  onEdit: (service: UtilityService) => void;
  onDelete: (service: UtilityService) => void;
}

const actionClassName =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-700 transition dark:text-gray-400";

const ActiveSwitch: React.FC<{ service: UtilityService }> = ({ service }) => {
  const updateMutation = useUpdateUtilityService();

  return (
    <Switch
      label={service.isActive ? "On" : "Off"}
      checked={service.isActive}
      disabled={updateMutation.isPending}
      onChange={(isActive) =>
        updateMutation.mutate(
          { id: service.id, payload: { isActive } },
          {
            onSuccess: () =>
              toast.success(
                `${service.name} service ${isActive ? "enabled" : "disabled"} successfully`,
              ),
            onError: (error) => toast.error(error.message),
          },
        )
      }
    />
  );
};

export const UtilityServicesTable: React.FC<UtilityServicesTableProps> = ({
  services,
  isLoading,
  isFetching = false,
  hasError = false,
  onEdit,
  onDelete,
}) => {
  const columns: SortableColumn<UtilityService>[] = [
    {
      label: "Name",
      cellClassName:
        "text-theme-sm px-5 py-4 text-start font-medium text-gray-800 sm:px-6 dark:text-white/90",
      render: (service) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <UtilityTypeIcon type={service.type} className="h-4 w-4" />
          </span>
          {service.name}
        </div>
      ),
    },
    {
      label: "Billing method",
      render: (service) => UTILITY_BILLING_METHOD_LABELS[service.billingMethod],
    },
    {
      label: "Unit",
      render: (service) => service.unit,
    },
    {
      label: "Default price",
      render: (service) =>
        formatUnitPrice(service.defaultUnitPrice, service.unit),
    },
    {
      label: "Active",
      render: (service) => <ActiveSwitch service={service} />,
    },
    {
      label: "Actions",
      render: (service) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Edit ${service.name}`}
            onClick={() => onEdit(service)}
            className={`${actionClassName} hover:text-brand-500 dark:hover:text-brand-500`}
          >
            <SquarePen className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label={`Delete ${service.name}`}
            onClick={() => onDelete(service)}
            className={`${actionClassName} hover:text-error-500 dark:hover:text-error-500`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ),
    },
  ];

  return (
    <SortableDataTable
      columns={columns}
      rows={services}
      rowKey={(service) => service.id}
      isLoading={isLoading}
      isFetching={isFetching}
      hasError={hasError}
      onSortChange={() => {}}
      emptyMessage="No utility services."
      minWidthClassName="min-w-[800px]"
    />
  );
};
