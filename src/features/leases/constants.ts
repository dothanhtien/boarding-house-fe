export const LeaseStatus = {
  Draft: "draft",
  Active: "active",
  Expired: "expired",
  Terminated: "terminated",
} as const;

export type LeaseStatus = (typeof LeaseStatus)[keyof typeof LeaseStatus];

export const MAX_LEASE_TENANTS = 20;

export const LEASE_CODE_MAX_LENGTH = 50;

export const LEASE_STATUS_OPTIONS: { value: LeaseStatus; label: string }[] = [
  { value: LeaseStatus.Draft, label: "Draft" },
  { value: LeaseStatus.Active, label: "Active" },
  { value: LeaseStatus.Expired, label: "Expired" },
  { value: LeaseStatus.Terminated, label: "Terminated" },
];

export const LEASE_STATUS_LABELS = Object.fromEntries(
  LEASE_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<LeaseStatus, string>;

export const LeaseOrigin = {
  Room: "room",
} as const;

export type LeaseOrigin = (typeof LeaseOrigin)[keyof typeof LeaseOrigin];

export const parseLeaseOrigin = (value: unknown): LeaseOrigin | undefined =>
  value === LeaseOrigin.Room ? value : undefined;
