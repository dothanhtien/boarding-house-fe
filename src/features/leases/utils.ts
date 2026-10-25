import type { Room } from "@/features/rooms/types";
import { DateFormat, formatDate, getUtcToday } from "@/utils/date";
import { LeaseOrigin, LeaseStatus } from "./constants";
import type { LeaseTenantFormValue } from "./schemas";
import type { Lease, LeaseTenant, UpdateLeaseTenantPayload } from "./types";

export function formatLeaseTerm(lease: Pick<Lease, "startDate" | "endDate">) {
  const start = formatDate(lease.startDate, DateFormat.Date);
  return lease.endDate
    ? `${start} → ${formatDate(lease.endDate, DateFormat.Date)}`
    : `${start} → Open-ended`;
}

export const isLeaseEditable = (lease: Pick<Lease, "status">) =>
  lease.status === LeaseStatus.Draft;

export const isLeaseTerminable = (lease: Pick<Lease, "status">) =>
  lease.status === LeaseStatus.Active;

export const getLatestLeftDate = (
  lease: Pick<Lease, "startDate">,
  today: string = getUtcToday(),
) => {
  const startDate = lease.startDate.slice(0, 10);
  return today > startDate ? today : startDate;
};

export type ActivationBlocker = {
  message: string;
  fixableInForm: boolean;
};

export function getActivationBlockers(
  lease: Pick<Lease, "status" | "endDate" | "tenants">,
  room: Pick<Room, "capacity" | "roomStatus"> | undefined,
  today: string = getUtcToday(),
): ActivationBlocker[] {
  if (lease.status !== LeaseStatus.Draft)
    return [
      { message: "Only draft leases can be activated", fixableInForm: false },
    ];

  const blockers: ActivationBlocker[] = [];
  const representatives = lease.tenants.filter(
    (tenant) => tenant.isRepresentative,
  );

  if (lease.tenants.length === 0)
    blockers.push({ message: "Add at least one tenant", fixableInForm: true });
  else if (representatives.length !== 1)
    blockers.push({
      message: "Mark exactly one tenant as the representative",
      fixableInForm: true,
    });

  if (room?.capacity != null && lease.tenants.length > room.capacity)
    blockers.push({
      message: `The room allows at most ${room.capacity} tenants`,
      fixableInForm: true,
    });

  if (lease.endDate && lease.endDate.slice(0, 10) <= today)
    blockers.push({
      message: "The end date has already passed",
      fixableInForm: true,
    });

  if (room?.roomStatus === "maintenance")
    blockers.push({
      message: "The room is under maintenance",
      fixableInForm: false,
    });

  return blockers;
}

export function buildTenantChanges(
  original: LeaseTenant[],
  values: LeaseTenantFormValue[],
): UpdateLeaseTenantPayload[] {
  const updates: UpdateLeaseTenantPayload[] = [];
  const creations: UpdateLeaseTenantPayload[] = [];
  const keptIds = new Set<string>();

  for (const value of values) {
    const joinedDate = value.joinedDate || null;
    const existing =
      original.find(
        (tenant) => !keptIds.has(tenant.id) && tenant.id === value.tenantId,
      ) ??
      original.find(
        (tenant) => !keptIds.has(tenant.id) && tenant.userId === value.userId,
      );

    if (!existing) {
      creations.push({
        userId: value.userId,
        isRepresentative: value.isRepresentative,
        joinedDate,
      });
      continue;
    }

    keptIds.add(existing.id);
    const change: UpdateLeaseTenantPayload = { id: existing.id };
    if (value.isRepresentative !== existing.isRepresentative)
      change.isRepresentative = value.isRepresentative;
    if (joinedDate !== existing.joinedDate) change.joinedDate = joinedDate;
    if (Object.keys(change).length > 1) updates.push(change);
  }

  const deletions: UpdateLeaseTenantPayload[] = original
    .filter((tenant) => !keptIds.has(tenant.id))
    .map((tenant) => ({ id: tenant.id, isDeleted: true }));

  return [
    ...deletions,
    ...updates.filter((change) => change.isRepresentative === false),
    ...updates.filter((change) => change.isRepresentative !== false),
    ...creations,
  ];
}

export const parseLeaseOrigin = (value: unknown): LeaseOrigin | undefined =>
  value === LeaseOrigin.Room ? value : undefined;
