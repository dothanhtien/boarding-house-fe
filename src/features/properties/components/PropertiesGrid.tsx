import React from "react";
import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { ROUTES } from "@/config/routeDefinition";
import type { Property } from "@/features/properties/types";
import { formatDate } from "@/utils/date";
import { PencilIcon, TrashBinIcon } from "@/icons";

const SAMPLE_COVER_IMAGES = [
  "/images/grid-image/image-01.png",
  "/images/grid-image/image-02.png",
  "/images/grid-image/image-03.png",
  "/images/grid-image/image-04.png",
  "/images/grid-image/image-05.png",
  "/images/grid-image/image-06.png",
];

function getCoverImage(property: Property) {
  let hash = 0;
  for (let i = 0; i < property.id.length; i++) {
    hash = (hash * 31 + property.id.charCodeAt(i)) >>> 0;
  }
  return SAMPLE_COVER_IMAGES[hash % SAMPLE_COVER_IMAGES.length];
}

interface PropertiesGridProps {
  properties: Property[];
  isLoading: boolean;
  isFetching?: boolean;
  hasError?: boolean;
  emptyMessage?: string;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
}

function formatAddress(property: Property) {
  return (
    [property.address, property.ward, property.district, property.province]
      .filter(Boolean)
      .join(", ") || "—"
  );
}

function formatLateFee(property: Property) {
  if (!property.lateFeeType || property.lateFeeValue == null) return "—";
  const value =
    property.lateFeeType === "percent"
      ? `${property.lateFeeValue}%`
      : property.lateFeeValue.toLocaleString();
  return property.lateFeeGraceDays != null
    ? `${value} (${property.lateFeeGraceDays} grace days)`
    : value;
}

function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="aspect-video w-full bg-gray-200 dark:bg-gray-700" />
      <div className="p-5">
        <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-3 h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

export function PropertiesGrid({
  properties,
  isLoading,
  isFetching = false,
  hasError = false,
  emptyMessage = "No properties found.",
  onEdit,
  onDelete,
}: PropertiesGridProps) {
  if (isLoading && properties.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <PropertyCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!isLoading && !hasError && properties.length === 0) {
    return (
      <div className="text-theme-sm rounded-xl border border-gray-200 bg-white px-5 py-10 text-center text-gray-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="relative">
      {isFetching && !isLoading && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-white/40 dark:bg-gray-900/40" />
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property, index) => (
          <div
            key={property.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Link
                href={ROUTES.propertyRooms(property.id)}
                aria-label={`Manage rooms of ${property.name}`}
                className="absolute inset-0"
              >
                <Image
                  src={getCoverImage(property)}
                  alt={property.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  priority={index < 3}
                />
              </Link>
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Edit property"
                  onClick={() => onEdit(property)}
                  className="shadow-theme-xs inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Delete property"
                  onClick={() => onDelete(property)}
                  className="shadow-theme-xs inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
                >
                  <TrashBinIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
                  <Link
                    href={ROUTES.propertyRooms(property.id)}
                    className="hover:text-brand-500 dark:hover:text-brand-400"
                  >
                    {property.name}
                  </Link>
                </h3>
                <Badge
                  size="sm"
                  color={property.isActive ? "success" : "error"}
                >
                  {property.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <p className="text-theme-xs mt-2 text-gray-500 dark:text-gray-400">
                {formatAddress(property)}
              </p>

              <div className="text-theme-xs mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 dark:text-gray-500">
                    Billing day
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {property.defaultBillingDay ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-500">Late fee</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {formatLateFee(property)}
                  </p>
                </div>
              </div>

              <div className="text-theme-xs mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 dark:text-gray-500">Created</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {formatDate(property.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
