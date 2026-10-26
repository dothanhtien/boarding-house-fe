"use client";

import React, { useState } from "react";
import { Pause, Play, SquarePen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Badge from "@/components/ui/badge/Badge";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import {
  usePendingLeaseServiceIds,
  useUpsertLeaseUtilityService,
} from "@/features/lease-utility-services/mutations";
import { useLeaseUtilityServices } from "@/features/lease-utility-services/queries";
import type { LeaseUtilityService } from "@/features/lease-utility-services/types";
import {
  formatQuantityTotal,
  getAttachableServices,
  getLeaseServiceActions,
  getStaleStateErrorMessage,
} from "@/features/lease-utility-services/utils";
import { LeaseStatus } from "@/features/leases/constants";
import type { Lease } from "@/features/leases/types";
import { UtilityTypeIcon } from "@/features/utility-services/components/UtilityTypeIcon";
import { UTILITY_BILLING_METHOD_LABELS } from "@/features/utility-services/constants";
import { useUtilityServices } from "@/features/utility-services/queries";
import type { UtilityService } from "@/features/utility-services/types";
import { formatUnitPrice } from "@/features/utility-services/utils";
import type { ApiError } from "@/lib/axios";
import { AddLeaseServiceDropdown } from "./AddLeaseServiceDropdown";
import { LeaseServicePriceModal } from "./LeaseServicePriceModal";
import { RemoveLeaseServiceDialog } from "./RemoveLeaseServiceDialog";

interface LeaseUtilityServicesCardProps {
  lease: Lease;
}

type OpenDialog = { type: "price" | "remove"; service: LeaseUtilityService };

const actionClassName =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-white/5";

const showActionError = (error: ApiError) =>
  toast.error(getStaleStateErrorMessage(error) ?? error.message);

export const LeaseUtilityServicesCard: React.FC<
  LeaseUtilityServicesCardProps
> = ({ lease }) => {
  const [dialog, setDialog] = useState<OpenDialog | null>(null);
  const closeDialog = () => setDialog(null);
  const actions = getLeaseServiceActions(lease.status);
  const upsertMutation = useUpsertLeaseUtilityService();

  const {
    data: services = [],
    isLoading,
    error,
  } = useLeaseUtilityServices(lease.id);
  const { data: propertyServices = [], isLoading: isLoadingPropertyServices } =
    useUtilityServices(
      { propertyId: lease.propertyId },
      { enabled: actions.canAdd },
    );
  const attachableServices = getAttachableServices(propertyServices, services);

  const pendingServiceIds = usePendingLeaseServiceIds(lease.id);
  const isRowPending = (serviceId: string) =>
    pendingServiceIds.includes(serviceId);

  const handleAdd = (service: UtilityService) => {
    upsertMutation
      .mutateAsync({ leaseId: lease.id, serviceId: service.id, payload: {} })
      .then(() => toast.success(`${service.name} added`), showActionError);
  };

  const handleToggleActive = (service: LeaseUtilityService) => {
    upsertMutation
      .mutateAsync({
        leaseId: lease.id,
        serviceId: service.serviceId,
        payload: { isActive: !service.isActive },
      })
      .catch(showActionError);
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="mb-5 flex items-center justify-between gap-3 lg:mb-6">
        <div className="flex items-center gap-3">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Utility services
          </h4>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({services.length})
          </span>
        </div>
        {actions.canAdd && (
          <AddLeaseServiceDropdown
            services={attachableServices}
            isLoading={isLoading || isLoadingPropertyServices}
            disabled={pendingServiceIds.length > 0}
            onSelect={handleAdd}
          />
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-error-500 text-sm">{error.message}</p>
      ) : services.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No utility services on this lease.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {services.map((service) => {
            const isPending = isRowPending(service.serviceId);
            const hasCustomPrice = service.unitPriceOverride !== null;

            return (
              <li
                key={service.serviceId}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 px-4 py-3 sm:flex-row sm:items-center dark:border-gray-800"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    <UtilityTypeIcon type={service.type} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={`truncate text-sm font-medium ${
                          service.isActive
                            ? "text-gray-800 dark:text-white/90"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {service.name}
                      </p>
                      <Badge size="sm" color="light">
                        {UTILITY_BILLING_METHOD_LABELS[service.billingMethod]}
                      </Badge>
                      {hasCustomPrice && (
                        <Badge size="sm" color="primary">
                          Custom price
                        </Badge>
                      )}
                      {!service.isActive && (
                        <Badge size="sm" color="warning">
                          Paused
                        </Badge>
                      )}
                      {!service.serviceIsActive && (
                        <Badge size="sm" color="error">
                          Discontinued
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      {formatUnitPrice(
                        service.effectiveUnitPrice,
                        service.unit,
                      )}
                      {hasCustomPrice && (
                        <span className="ml-2 text-xs text-gray-400 line-through dark:text-gray-500">
                          {formatUnitPrice(
                            service.defaultUnitPrice,
                            service.unit,
                          )}
                        </span>
                      )}
                    </p>
                    {service.quantity > 1 && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {formatQuantityTotal(
                          service.effectiveUnitPrice,
                          service.quantity,
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {actions.canEditPrice && (
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      type="button"
                      aria-label={`Edit ${service.name}`}
                      title="Edit"
                      disabled={isPending}
                      onClick={() => setDialog({ type: "price", service })}
                      className={actionClassName}
                    >
                      <SquarePen className="h-4 w-4" aria-hidden />
                    </button>
                    {actions.canToggleActive && (
                      <button
                        type="button"
                        aria-label={`${service.isActive ? "Pause" : "Resume"} ${service.name}`}
                        title={service.isActive ? "Pause" : "Resume"}
                        disabled={isPending}
                        onClick={() => handleToggleActive(service)}
                        className={actionClassName}
                      >
                        {service.isActive ? (
                          <Pause className="h-4 w-4" aria-hidden />
                        ) : (
                          <Play className="h-4 w-4" aria-hidden />
                        )}
                      </button>
                    )}
                    {actions.canRemove ? (
                      <button
                        type="button"
                        aria-label={`Remove ${service.name}`}
                        title="Remove"
                        disabled={isPending}
                        onClick={() => setDialog({ type: "remove", service })}
                        className={`${actionClassName} hover:text-error-500 dark:hover:text-error-500`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    ) : (
                      <Tooltip content="Pause it instead">
                        <button
                          type="button"
                          aria-label={`Remove ${service.name}`}
                          disabled
                          className={actionClassName}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {dialog?.type === "price" && (
        <LeaseServicePriceModal
          leaseId={lease.id}
          isLeaseActive={lease.status === LeaseStatus.Active}
          service={dialog.service}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === "remove" && (
        <RemoveLeaseServiceDialog
          leaseId={lease.id}
          service={dialog.service}
          onClose={closeDialog}
        />
      )}
    </div>
  );
};
