"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheck, CircleX, SquarePen, Trash2 } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { InfoItem } from "@/components/ui/info-item/InfoItem";
import { ROUTES } from "@/config/routeDefinition";
import { LeaseOrigin, LeaseStatus } from "@/features/leases/constants";
import { useLease } from "@/features/leases/queries";
import type { Lease } from "@/features/leases/types";
import {
  formatLeaseTerm,
  getActivationBlockers,
  isLeaseEditable,
  isLeaseTerminable,
} from "@/features/leases/utils";
import { useProperty } from "@/features/properties/queries";
import { useRoom } from "@/features/rooms/queries";
import { ChevronLeftIcon } from "@/icons";
import { formatCurrency } from "@/utils/currency";
import { DateFormat, formatDate } from "@/utils/date";
import { ActivateLeaseDialog } from "./ActivateLeaseDialog";
import { DeleteLeaseDialog } from "./DeleteLeaseDialog";
import { LeaseStatusBadge } from "./LeaseStatusBadge";
import { TerminateLeaseModal } from "./TerminateLeaseModal";

interface LeaseDetailViewProps {
  leaseId: string;
  origin?: LeaseOrigin;
}

const linkClassName = "text-brand-500 hover:text-brand-600 hover:underline";

const formatBillingDay = (lease: Lease) =>
  lease.billingDay != null
    ? `Day ${lease.billingDay}`
    : `Day ${Number(lease.startDate.slice(8, 10))} (start date)`;

const LeaseTenantsCard: React.FC<{ lease: Lease }> = ({ lease }) => (
  <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
    <div className="mb-5 flex items-center gap-3 lg:mb-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Tenants
      </h4>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        ({lease.tenants.length})
      </span>
    </div>

    {lease.tenants.length === 0 ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No tenants yet.
      </p>
    ) : (
      <ul className="flex flex-col gap-3">
        {lease.tenants.map((tenant) => (
          <li
            key={tenant.id}
            className="grid grid-cols-2 items-center gap-4 rounded-lg border border-gray-200 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_160px_160px_160px] dark:border-gray-800"
          >
            <div className="col-span-2 min-w-0 sm:col-span-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                  {tenant.fullName}
                </p>
                {tenant.isRepresentative && (
                  <Badge size="sm" color="primary">
                    Representative
                  </Badge>
                )}
              </div>
            </div>
            <InfoItem label="Phone" value={tenant.phone} />
            <InfoItem
              label="Joined"
              value={
                tenant.joinedDate
                  ? formatDate(tenant.joinedDate, DateFormat.Date)
                  : "Start date"
              }
            />
            <InfoItem
              label="Left"
              value={
                tenant.leftDate
                  ? formatDate(tenant.leftDate, DateFormat.Date)
                  : null
              }
            />
          </li>
        ))}
      </ul>
    )}
  </div>
);

export function LeaseDetailView({ leaseId, origin }: LeaseDetailViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);
  const { data: lease, isLoading, error } = useLease(leaseId);
  const { data: property } = useProperty(lease?.propertyId ?? "", {
    enabled: !!lease,
  });
  const {
    data: room,
    isLoading: isRoomLoading,
    error: roomError,
  } = useRoom(lease?.roomId ?? "", { enabled: !!lease });

  const { activationBlockers, hasFormFixableBlocker } = useMemo(() => {
    const blockers =
      lease && isLeaseEditable(lease) ? getActivationBlockers(lease, room) : [];
    return {
      activationBlockers: blockers,
      hasFormFixableBlocker: blockers.some((blocker) => blocker.fixableInForm),
    };
  }, [lease, room]);
  const canActivate =
    !isRoomLoading && !roomError && activationBlockers.length === 0;

  const roomPath = lease && ROUTES.roomDetail(lease.propertyId, lease.roomId);
  const isFromRoom = origin === LeaseOrigin.Room;
  const backPath = isFromRoom && roomPath ? roomPath : ROUTES.leases;

  return (
    <div>
      <PageBreadcrumb
        pageTitle={lease ? `Lease ${lease.leaseCode}` : "Lease"}
      />

      <Link
        href={backPath}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        {isFromRoom
          ? `Back to room ${lease?.roomNumber ?? ""}`
          : "Back to leases"}
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        {isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        )}

        {error && !isLoading && (
          <p className="text-error-500 text-sm">{error.message}</p>
        )}

        {lease && roomPath && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {lease.leaseCode}
                    </h4>
                    <LeaseStatusBadge status={lease.status} />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <Link href={roomPath} className={linkClassName}>
                      Room {lease.roomNumber}
                    </Link>
                    {property && ` · ${property.name}`}
                    {" · "}
                    {formatLeaseTerm(lease)}
                  </p>

                  <p className="mt-5 mb-1 text-3xl font-medium text-gray-800 dark:text-white/90">
                    {formatCurrency(lease.monthlyRent)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Monthly rent
                  </p>
                </div>

                {isLeaseEditable(lease) ? (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setIsActivating(true)}
                      disabled={!canActivate}
                      className="shadow-theme-xs bg-brand-500 hover:bg-brand-600 focus-visible:ring-brand-500/20 disabled:bg-brand-300 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition focus-visible:ring-3 focus-visible:outline-hidden disabled:cursor-not-allowed sm:w-auto"
                    >
                      <CircleCheck className="h-4 w-4" aria-hidden />
                      Activate
                    </button>
                    <Link
                      href={ROUTES.editLease(lease.id, origin)}
                      className="shadow-theme-xs inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-800 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                      <SquarePen className="h-4 w-4" aria-hidden />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsDeleting(true)}
                      className="shadow-theme-xs bg-error-500 hover:bg-error-600 focus-visible:ring-error-500/20 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition focus-visible:ring-3 focus-visible:outline-hidden sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Delete
                    </button>
                  </div>
                ) : isLeaseTerminable(lease) ? (
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <button
                      type="button"
                      onClick={() => setIsTerminating(true)}
                      className="shadow-theme-xs bg-error-500 hover:bg-error-600 focus-visible:ring-error-500/20 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition focus-visible:ring-3 focus-visible:outline-hidden sm:w-auto"
                    >
                      <CircleX className="h-4 w-4" aria-hidden />
                      Terminate
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Only draft leases can be edited or deleted.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Only draft leases can be edited or deleted.
                  </p>
                )}
              </div>

              {activationBlockers.length > 0 && (
                <div className="border-warning-500/30 bg-warning-50 dark:bg-warning-500/10 mt-6 rounded-lg border px-4 py-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    This lease can&apos;t be activated yet:
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-400">
                    {activationBlockers.map((blocker) => (
                      <li key={blocker.message}>{blocker.message}</li>
                    ))}
                  </ul>
                  {hasFormFixableBlocker && (
                    <Link
                      href={ROUTES.editLease(lease.id, origin)}
                      className={`mt-2 inline-block text-sm ${linkClassName}`}
                    >
                      Edit lease
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
              <h4 className="mb-5 text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
                Lease details
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7 xl:grid-cols-3">
                <InfoItem label="Lease code" value={lease.leaseCode} />
                <InfoItem
                  label="Room"
                  value={
                    <Link href={roomPath} className={linkClassName}>
                      Room {lease.roomNumber}
                    </Link>
                  }
                />
                <InfoItem label="Property" value={property?.name} />
                <InfoItem
                  label="Start date"
                  value={formatDate(lease.startDate, DateFormat.Date)}
                />
                <InfoItem
                  label="End date"
                  value={
                    lease.endDate
                      ? formatDate(lease.endDate, DateFormat.Date)
                      : "Open-ended"
                  }
                />
                <InfoItem label="Billing day" value={formatBillingDay(lease)} />
                <InfoItem
                  label="Monthly rent"
                  value={formatCurrency(lease.monthlyRent)}
                />
                <InfoItem
                  label="Deposit amount"
                  value={formatCurrency(lease.depositAmount)}
                />
                <InfoItem
                  label="Previous lease"
                  value={
                    lease.previousLeaseId && (
                      <Link
                        href={ROUTES.leaseDetail(lease.previousLeaseId, origin)}
                        className={linkClassName}
                      >
                        View previous lease
                      </Link>
                    )
                  }
                />
                <InfoItem
                  label="Signed at"
                  value={formatDate(lease.signedAt)}
                />
                <InfoItem
                  label="Created at"
                  value={formatDate(lease.createdAt)}
                />
                <InfoItem
                  label="Updated at"
                  value={formatDate(lease.updatedAt)}
                />
                {lease.status === LeaseStatus.Terminated && (
                  <>
                    <InfoItem
                      label="Terminated at"
                      value={formatDate(lease.terminatedAt)}
                    />
                    <InfoItem
                      label="Termination reason"
                      value={lease.terminationReason}
                    />
                  </>
                )}
              </div>
            </div>

            <LeaseTenantsCard lease={lease} />
          </div>
        )}
      </div>

      {lease && isActivating && (
        <ActivateLeaseDialog
          lease={lease}
          onClose={() => setIsActivating(false)}
        />
      )}

      {lease && isTerminating && (
        <TerminateLeaseModal
          lease={lease}
          onClose={() => setIsTerminating(false)}
        />
      )}

      {lease && isDeleting && (
        <DeleteLeaseDialog
          lease={lease}
          onClose={() => setIsDeleting(false)}
          onDeleted={() => router.push(backPath)}
        />
      )}
    </div>
  );
}
