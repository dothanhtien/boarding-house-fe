import { DateFormat, formatDate } from "@/utils/date";
import { LeaseStatus } from "./constants";
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
