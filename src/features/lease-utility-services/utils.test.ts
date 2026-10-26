import { describe, expect, it } from "vitest";
import { LeaseStatus } from "@/features/leases/constants";
import {
  UtilityBillingMethod,
  UtilityType,
} from "@/features/utility-services/constants";
import type { UtilityService } from "@/features/utility-services/types";
import type { LeaseUtilityService } from "./types";
import {
  formatQuantityTotal,
  getAttachableServices,
  getLeaseServiceActions,
} from "./utils";

const service = (overrides: Partial<UtilityService> = {}): UtilityService => ({
  id: "service-1",
  propertyId: "property-1",
  name: "Electricity",
  type: UtilityType.Electricity,
  billingMethod: UtilityBillingMethod.Metered,
  unit: "kWh",
  defaultUnitPrice: 3500,
  isActive: true,
  createdAt: "2026-10-01T00:00:00Z",
  updatedAt: null,
  ...overrides,
});

const leaseService = (serviceId: string): LeaseUtilityService => ({
  serviceId,
  name: "Electricity",
  type: UtilityType.Electricity,
  billingMethod: UtilityBillingMethod.Metered,
  unit: "kWh",
  defaultUnitPrice: 3500,
  unitPriceOverride: null,
  effectiveUnitPrice: 3500,
  quantity: 1,
  isActive: true,
  serviceIsActive: true,
  createdAt: "2026-10-01T00:00:00Z",
  updatedAt: null,
});

describe("getLeaseServiceActions", () => {
  it("allows everything on a draft lease", () => {
    expect(getLeaseServiceActions(LeaseStatus.Draft)).toEqual({
      canAdd: true,
      canEditPrice: true,
      canToggleActive: true,
      canRemove: true,
    });
  });

  it("allows everything but removing on an active lease", () => {
    expect(getLeaseServiceActions(LeaseStatus.Active)).toEqual({
      canAdd: true,
      canEditPrice: true,
      canToggleActive: true,
      canRemove: false,
    });
  });

  it.each([LeaseStatus.Expired, LeaseStatus.Terminated])(
    "allows nothing on a %s lease",
    (status) => {
      expect(getLeaseServiceActions(status)).toEqual({
        canAdd: false,
        canEditPrice: false,
        canToggleActive: false,
        canRemove: false,
      });
    },
  );
});

describe("getAttachableServices", () => {
  it("excludes inactive services and services already on the lease", () => {
    const attached = service({ id: "attached" });
    const inactive = service({ id: "inactive", isActive: false });
    const available = service({ id: "available" });

    expect(
      getAttachableServices(
        [attached, inactive, available],
        [leaseService("attached")],
      ),
    ).toEqual([available]);
  });
});

describe("formatQuantityTotal", () => {
  it("shows quantity × unit price = total", () => {
    const formatted = formatQuantityTotal(150000, 2);

    expect(formatted).toMatch(/^2 × 150\.000.* = 300\.000/);
  });
});
