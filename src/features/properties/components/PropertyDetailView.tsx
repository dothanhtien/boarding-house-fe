"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Tabs } from "@/components/ui/tabs/Tabs";
import { ROUTES } from "@/config/routeDefinition";
import { PROPERTY_TABS, PropertyTab } from "@/features/properties/constants";
import { useProperty } from "@/features/properties/queries";
import { parsePropertyTab } from "@/features/properties/utils";
import { RoomsPanel } from "@/features/rooms/components/RoomsPanel";
import { UtilityServicesPanel } from "@/features/utility-services/components/UtilityServicesPanel";
import { ChevronLeftIcon } from "@/icons";

interface PropertyDetailViewProps {
  propertyId: string;
}

const TAB_ROUTES: Record<PropertyTab, (id: string) => string> = {
  [PropertyTab.Rooms]: ROUTES.propertyRooms,
  [PropertyTab.UtilityServices]: ROUTES.propertyUtilityServices,
};

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({
  propertyId,
}) => {
  const tab = parsePropertyTab(useSearchParams().get("tab"));
  const { data: property, error: propertyError } = useProperty(propertyId);

  const handleTabChange = (nextTab: PropertyTab) => {
    window.history.replaceState(null, "", TAB_ROUTES[nextTab](propertyId));
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={property ? property.name : "Property"} />

      <Link
        href={ROUTES.properties}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        Back to properties
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="space-y-5">
          {propertyError && (
            <p className="text-error-500 text-sm">{propertyError.message}</p>
          )}

          <Tabs
            tabs={PROPERTY_TABS}
            value={tab}
            onChange={handleTabChange}
            ariaLabel="Property sections"
          />

          <div role="tabpanel">
            {tab === PropertyTab.Rooms ? (
              <RoomsPanel propertyId={propertyId} canAddRoom={!!property} />
            ) : (
              <UtilityServicesPanel propertyId={propertyId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
