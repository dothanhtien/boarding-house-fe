"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useOrganization } from "@/features/organizations/queries";
import { OrganizationInfoCard } from "@/features/organizations/components/OrganizationInfoCard";
import { OrganizationMembersCard } from "@/features/organizations/components/OrganizationMembersCard";
import { OrganizationSettingsCard } from "@/features/organizations/components/OrganizationSettingsCard";

interface OrganizationEditViewProps {
  organizationId: string;
}

export const OrganizationEditView: React.FC<OrganizationEditViewProps> = ({
  organizationId,
}) => {
  const {
    data: organization,
    isLoading,
    error,
  } = useOrganization(organizationId);

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit organization" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        {isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        )}

        {error && !isLoading && (
          <p className="text-error-500 text-sm">{error.message}</p>
        )}

        <div className="space-y-6">
          {organization && <OrganizationInfoCard organization={organization} />}
          <OrganizationSettingsCard organizationId={organizationId} />
          {organization && (
            <OrganizationMembersCard organization={organization} />
          )}
        </div>
      </div>
    </div>
  );
};
