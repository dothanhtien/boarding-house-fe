"use client";

import React from "react";
import { useModal } from "@/hooks/useModal";
import { Organization } from "../types";
import Badge from "@/components/ui/badge/Badge";
import { InfoItem } from "@/components/ui/info-item/InfoItem";
import { PencilIcon } from "@/icons";
import { OrganizationInfoEditModal } from "./OrganizationInfoEditModal";

interface OrganizationInfoCardProps {
  organization: Organization;
}

export const OrganizationInfoCard: React.FC<OrganizationInfoCardProps> = ({
  organization,
}) => {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center gap-3 lg:mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Organization details
            </h4>
            <Badge
              size="sm"
              color={organization.isActive ? "success" : "error"}
            >
              {organization.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_7fr] lg:gap-7 2xl:gap-x-32">
            <InfoItem label="Name" value={organization.name} />
            <InfoItem label="Tax code" value={organization.taxCode} />
            <InfoItem label="Phone" value={organization.phone} />
            <InfoItem label="Email" value={organization.email} />
            <InfoItem label="Province" value={organization.province} />
            <InfoItem label="District" value={organization.district} />
            <InfoItem label="Ward" value={organization.ward} />
            <InfoItem label="Address" value={organization.address} />
          </div>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <PencilIcon className="h-4 w-4" />
          Edit
        </button>
      </div>

      <OrganizationInfoEditModal
        organization={organization}
        isOpen={isOpen}
        onClose={closeModal}
      />
    </div>
  );
};
