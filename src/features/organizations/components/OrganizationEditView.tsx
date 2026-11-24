"use client";

import React from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ROUTES } from "@/config/routeDefinition";
import { useOrganization } from "@/features/organizations/queries";
import { OrganizationInfoCard } from "@/features/organizations/components/OrganizationInfoCard";
import { OrganizationMembersCard } from "@/features/organizations/components/OrganizationMembersCard";
import { OrganizationSettingsCard } from "@/features/organizations/components/OrganizationSettingsCard";
import { RoleSlugs } from "@/enums/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { ChevronLeftIcon } from "@/icons";

const PLATFORM_ROLE_SLUGS: string[] = [
  RoleSlugs.PlatformAdmin,
  RoleSlugs.PlatformStaff,
];

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
  const { platformRoleSlug } = useUserRole();
  const canViewOrganizationList =
    platformRoleSlug && PLATFORM_ROLE_SLUGS.includes(platformRoleSlug);

  return (
    <div>
      <PageBreadcrumb pageTitle={organization?.name ?? "Organization"} />

      {canViewOrganizationList && (
        <Link
          href={ROUTES.organizations}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="h-5 w-5" />
          Back to organizations
        </Link>
      )}

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
  );
};
