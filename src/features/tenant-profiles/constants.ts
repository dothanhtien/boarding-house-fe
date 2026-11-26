export const IdentityType = {
  CitizenIdentityCard: "citizenIdentityCard",
  Passport: "passport",
  Other: "other",
} as const;

export type IdentityType = (typeof IdentityType)[keyof typeof IdentityType];

export const IDENTITY_TYPE_OPTIONS: { value: IdentityType; label: string }[] = [
  { value: IdentityType.CitizenIdentityCard, label: "Citizen identity card" },
  { value: IdentityType.Passport, label: "Passport" },
  { value: IdentityType.Other, label: "Other" },
];

export const IDENTITY_TYPE_LABELS = Object.fromEntries(
  IDENTITY_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<IdentityType, string>;

export const Gender = {
  Male: "male",
  Female: "female",
  Other: "other",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: Gender.Male, label: "Male" },
  { value: Gender.Female, label: "Female" },
  { value: Gender.Other, label: "Other" },
];

export const GENDER_LABELS = Object.fromEntries(
  GENDER_OPTIONS.map((option) => [option.value, option.label]),
) as Record<Gender, string>;

export const IDENTITY_NUMBER_MAX_LENGTH = 20;
export const IDENTITY_ISSUED_PLACE_MAX_LENGTH = 100;
export const PERMANENT_ADDRESS_MAX_LENGTH = 255;
export const EMERGENCY_CONTACT_NAME_MAX_LENGTH = 100;
export const EMERGENCY_CONTACT_PHONE_MAX_LENGTH = 20;
export const MAX_AGE_YEARS = 120;
