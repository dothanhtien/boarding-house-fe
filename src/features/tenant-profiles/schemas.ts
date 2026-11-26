import dayjs from "dayjs";
import { z } from "zod";
import { DateFormat } from "@/utils/date";
import {
  EMERGENCY_CONTACT_NAME_MAX_LENGTH,
  EMERGENCY_CONTACT_PHONE_MAX_LENGTH,
  Gender,
  IDENTITY_ISSUED_PLACE_MAX_LENGTH,
  IDENTITY_NUMBER_MAX_LENGTH,
  IdentityType,
  MAX_AGE_YEARS,
  PERMANENT_ADDRESS_MAX_LENGTH,
} from "./constants";
import type { TenantProfile, UpdateTenantProfilePayload } from "./types";

const IDENTITY_NUMBER_RULES: Record<
  IdentityType,
  { pattern: RegExp; message: string }
> = {
  [IdentityType.CitizenIdentityCard]: {
    pattern: /^\d{12}$/,
    message: "Citizen identity card number must be exactly 12 digits",
  },
  [IdentityType.Passport]: {
    pattern: /^[A-Za-z0-9]{6,20}$/,
    message: "Passport number must be 6 to 20 letters or digits",
  },
  [IdentityType.Other]: {
    pattern: /^[A-Za-z0-9]{4,20}$/,
    message: "Identity number must be 4 to 20 letters or digits",
  },
};

const today = () => dayjs().format(DateFormat.Date);

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} exceeds ${max} characters`);

export const tenantProfileSchema = z
  .object({
    identityType: z.union([z.enum(IdentityType), z.literal("")]),
    identityNumber: optionalText(IDENTITY_NUMBER_MAX_LENGTH, "Identity number"),
    identityIssuedDate: z.string(),
    identityIssuedPlace: optionalText(
      IDENTITY_ISSUED_PLACE_MAX_LENGTH,
      "Issued place",
    ),
    identityExpiryDate: z.string(),
    dateOfBirth: z.string(),
    gender: z.union([z.enum(Gender), z.literal("")]),
    permanentAddress: optionalText(
      PERMANENT_ADDRESS_MAX_LENGTH,
      "Permanent address",
    ),
    emergencyContactName: optionalText(
      EMERGENCY_CONTACT_NAME_MAX_LENGTH,
      "Emergency contact name",
    ),
    emergencyContactPhone: optionalText(
      EMERGENCY_CONTACT_PHONE_MAX_LENGTH,
      "Emergency contact phone",
    ).regex(
      /^(\+?\d+)?$/,
      "Phone must contain only digits, optionally starting with +",
    ),
  })
  .superRefine((values, ctx) => {
    if (values.identityType && !values.identityNumber) {
      ctx.addIssue({
        code: "custom",
        path: ["identityNumber"],
        message: "Identity number is required",
      });
    }
    if (values.identityNumber && !values.identityType) {
      ctx.addIssue({
        code: "custom",
        path: ["identityType"],
        message: "Identity type is required",
      });
    }
    if (values.identityType && values.identityNumber) {
      const rule = IDENTITY_NUMBER_RULES[values.identityType];
      if (!rule.pattern.test(values.identityNumber)) {
        ctx.addIssue({
          code: "custom",
          path: ["identityNumber"],
          message: rule.message,
        });
      }
    }
    const hasIdentityNumber = !!values.identityNumber;
    if (
      hasIdentityNumber &&
      values.identityIssuedDate &&
      values.identityIssuedDate > today()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["identityIssuedDate"],
        message: "Issued date must not be in the future",
      });
    }
    if (
      hasIdentityNumber &&
      values.identityIssuedDate &&
      values.identityExpiryDate &&
      values.identityExpiryDate <= values.identityIssuedDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["identityExpiryDate"],
        message: "Expiry date must be after the issued date",
      });
    }
    if (values.dateOfBirth) {
      const oldest = dayjs()
        .subtract(MAX_AGE_YEARS, "year")
        .format(DateFormat.Date);
      if (values.dateOfBirth > today()) {
        ctx.addIssue({
          code: "custom",
          path: ["dateOfBirth"],
          message: "Date of birth must not be in the future",
        });
      } else if (values.dateOfBirth < oldest) {
        ctx.addIssue({
          code: "custom",
          path: ["dateOfBirth"],
          message: `Date of birth must be within the last ${MAX_AGE_YEARS} years`,
        });
      }
    }
  });

export type TenantProfileFormValues = z.infer<typeof tenantProfileSchema>;

export const TENANT_PROFILE_FORM_FIELDS = [
  "identityType",
  "identityNumber",
  "identityIssuedDate",
  "identityIssuedPlace",
  "identityExpiryDate",
  "dateOfBirth",
  "gender",
  "permanentAddress",
  "emergencyContactName",
  "emergencyContactPhone",
] as const satisfies (keyof TenantProfileFormValues)[];

export const toTenantProfileFormValues = (
  profile: TenantProfile | null,
): TenantProfileFormValues => ({
  identityType: profile?.identityType ?? "",
  identityNumber: profile?.identityNumber ?? "",
  identityIssuedDate: profile?.identityIssuedDate ?? "",
  identityIssuedPlace: profile?.identityIssuedPlace ?? "",
  identityExpiryDate: profile?.identityExpiryDate ?? "",
  dateOfBirth: profile?.dateOfBirth ?? "",
  gender: profile?.gender ?? "",
  permanentAddress: profile?.permanentAddress ?? "",
  emergencyContactName: profile?.emergencyContactName ?? "",
  emergencyContactPhone: profile?.emergencyContactPhone ?? "",
});

const orNull = (value: string) => value.trim() || null;

export function toTenantProfilePayload(
  values: TenantProfileFormValues,
): UpdateTenantProfilePayload {
  const hasIdentity = !!values.identityNumber.trim();

  return {
    identityType:
      hasIdentity && values.identityType ? values.identityType : null,
    identityNumber: hasIdentity ? values.identityNumber.trim() : null,
    identityIssuedDate: hasIdentity ? orNull(values.identityIssuedDate) : null,
    identityIssuedPlace: hasIdentity
      ? orNull(values.identityIssuedPlace)
      : null,
    identityExpiryDate: hasIdentity ? orNull(values.identityExpiryDate) : null,
    dateOfBirth: orNull(values.dateOfBirth),
    gender: values.gender || null,
    permanentAddress: orNull(values.permanentAddress),
    emergencyContactName: orNull(values.emergencyContactName),
    emergencyContactPhone: orNull(values.emergencyContactPhone),
  };
}

export const isTenantProfilePayloadEmpty = (
  payload: UpdateTenantProfilePayload,
) => Object.values(payload).every((value) => value === null);
