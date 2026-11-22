import type { Metadata } from "next";
import { UtilityReadingsView } from "@/features/utility-readings/components/UtilityReadingsView";
import { isMonthValue } from "@/features/utility-readings/utils";

export const metadata: Metadata = {
  title: "Meter Readings | Boarding House",
  description:
    "Record monthly utility meter readings for every room of a property",
};

export default async function UtilityReadings({
  searchParams,
}: {
  searchParams: Promise<{
    propertyId?: string | string[];
    month?: string | string[];
  }>;
}) {
  const { propertyId, month } = await searchParams;

  return (
    <UtilityReadingsView
      initialPropertyId={
        typeof propertyId === "string" ? propertyId : undefined
      }
      initialMonth={isMonthValue(month) ? month : undefined}
    />
  );
}
