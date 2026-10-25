"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ROUTES } from "@/config/routeDefinition";
import type { LeaseOrigin } from "@/features/leases/constants";
import { useLease } from "@/features/leases/queries";
import { isLeaseEditable } from "@/features/leases/utils";
import { useProperty } from "@/features/properties/queries";
import { ChevronLeftIcon } from "@/icons";
import { EditLeaseForm } from "./EditLeaseForm";

interface EditLeaseViewProps {
  leaseId: string;
  origin?: LeaseOrigin;
}

export function EditLeaseView({ leaseId, origin }: EditLeaseViewProps) {
  const router = useRouter();
  const { data: lease, isLoading, error } = useLease(leaseId);
  const { data: property } = useProperty(lease?.propertyId ?? "", {
    enabled: !!lease,
  });

  const leasePath = ROUTES.leaseDetail(leaseId, origin);

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit lease" />

      <Link
        href={leasePath}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        Back to lease {lease?.leaseCode ?? ""}
        {property && ` · ${property.name}`}
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        {isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        )}

        {error && !isLoading && (
          <p className="text-error-500 text-sm">{error.message}</p>
        )}

        {lease && !isLeaseEditable(lease) && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Only draft leases can be edited.{" "}
            <Link href={leasePath} className="text-brand-500 hover:underline">
              View lease
            </Link>
          </p>
        )}

        {lease && isLeaseEditable(lease) && (
          <EditLeaseForm lease={lease} onDone={() => router.push(leasePath)} />
        )}
      </div>
    </div>
  );
}
