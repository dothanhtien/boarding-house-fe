"use client";

import React, { useState } from "react";
import type { UtilityServicePreset } from "@/features/utility-services/constants";
import { useUtilityServices } from "@/features/utility-services/queries";
import type { UtilityService } from "@/features/utility-services/types";
import { getMissingPresets } from "@/features/utility-services/utils";
import { AddUtilityServiceButton } from "./AddUtilityServiceButton";
import { CreateUtilityServiceModal } from "./CreateUtilityServiceModal";
import { DeleteUtilityServiceDialog } from "./DeleteUtilityServiceDialog";
import { EditUtilityServiceModal } from "./EditUtilityServiceModal";
import { UtilityServicesEmptyState } from "./UtilityServicesEmptyState";
import { UtilityServicesTable } from "./UtilityServicesTable";

interface UtilityServicesPanelProps {
  propertyId: string;
}

type OpenDialog =
  | { type: "create"; preset?: UtilityServicePreset }
  | { type: "edit" | "delete"; service: UtilityService };

export const UtilityServicesPanel: React.FC<UtilityServicesPanelProps> = ({
  propertyId,
}) => {
  const [dialog, setDialog] = useState<OpenDialog | null>(null);
  const closeDialog = () => setDialog(null);

  const {
    data: services = [],
    isLoading,
    isFetching,
    error,
  } = useUtilityServices({ propertyId });

  const openCreate = (preset?: UtilityServicePreset) =>
    setDialog({ type: "create", preset });
  const isEmpty = !isLoading && !error && services.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Services and default prices charged to tenants of this property.
        </p>
        {!isEmpty && (
          <AddUtilityServiceButton
            presets={getMissingPresets(services)}
            onAdd={openCreate}
          />
        )}
      </div>

      {error && <p className="text-error-500 text-sm">{error.message}</p>}

      {isEmpty ? (
        <UtilityServicesEmptyState onAdd={openCreate} />
      ) : (
        <>
          <UtilityServicesTable
            services={services}
            isLoading={isLoading}
            isFetching={isFetching}
            hasError={!!error}
            onEdit={(service) => setDialog({ type: "edit", service })}
            onDelete={(service) => setDialog({ type: "delete", service })}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Pick which services a lease uses when creating it or from the lease
            page.
          </p>
        </>
      )}

      {dialog?.type === "create" && (
        <CreateUtilityServiceModal
          propertyId={propertyId}
          preset={dialog.preset}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === "edit" && (
        <EditUtilityServiceModal
          service={dialog.service}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === "delete" && (
        <DeleteUtilityServiceDialog
          service={dialog.service}
          onClose={closeDialog}
        />
      )}
    </div>
  );
};
