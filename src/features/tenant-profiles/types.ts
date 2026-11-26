import type { Gender, IdentityType } from "./constants";

export type TenantProfile = {
  id: string;
  userId: string;
  identityType: IdentityType | null;
  identityNumber: string | null;
  identityIssuedDate: string | null;
  identityIssuedPlace: string | null;
  identityExpiryDate: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  permanentAddress: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type UpdateTenantProfilePayload = Partial<
  Pick<
    TenantProfile,
    | "identityType"
    | "identityNumber"
    | "identityIssuedDate"
    | "identityIssuedPlace"
    | "identityExpiryDate"
    | "dateOfBirth"
    | "gender"
    | "permanentAddress"
    | "emergencyContactName"
    | "emergencyContactPhone"
  >
>;
