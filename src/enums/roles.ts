export const RoleSlugs = {
  PlatformAdmin: "platform_admin",
  PlatformStaff: "platform_staff",
  OrganizationAdmin: "organization_admin",
  OrganizationStaff: "organization_staff",
} as const;

export type RoleSlugs = (typeof RoleSlugs)[keyof typeof RoleSlugs];
