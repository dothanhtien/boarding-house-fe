import { describe, expect, it } from "vitest";
import { UtilityBillingMethod, UtilityType } from "./constants";
import type { UpdateUtilityServiceFormValues } from "./schemas";
import type { UtilityService } from "./types";
import {
  buildUpdateUtilityServicePayload,
  formatUnitPrice,
  getDefaultBillingMethod,
  getDefaultUnit,
  getMissingPresets,
  isDuplicateNameError,
  supportsQuantity,
} from "./utils";

describe("getDefaultBillingMethod", () => {
  it.each([UtilityType.Electricity, UtilityType.Water])(
    "returns metered for %s",
    (type) => {
      expect(getDefaultBillingMethod(type)).toBe(UtilityBillingMethod.Metered);
    },
  );

  it.each([
    UtilityType.Internet,
    UtilityType.Parking,
    UtilityType.Garbage,
    UtilityType.Other,
  ])("returns fixed for %s", (type) => {
    expect(getDefaultBillingMethod(type)).toBe(UtilityBillingMethod.Fixed);
  });
});

describe("getDefaultUnit", () => {
  it.each([
    [UtilityType.Electricity, UtilityBillingMethod.Metered, "kWh"],
    [UtilityType.Water, UtilityBillingMethod.Metered, "m³"],
    [UtilityType.Water, UtilityBillingMethod.PerTenant, "person"],
    [UtilityType.Internet, UtilityBillingMethod.Fixed, "month"],
    [UtilityType.Other, UtilityBillingMethod.Fixed, ""],
  ])("returns the unit for %s billed %s", (type, billingMethod, unit) => {
    expect(getDefaultUnit(type, billingMethod)).toBe(unit);
  });
});

describe("formatUnitPrice", () => {
  it("formats the price per unit", () => {
    const formatted = formatUnitPrice(3500, "kWh");

    expect(formatted).toContain("3.500");
    expect(formatted.endsWith("/kWh")).toBe(true);
  });
});

describe("buildUpdateUtilityServicePayload", () => {
  const values: UpdateUtilityServiceFormValues = {
    name: "  Electricity  ",
    type: UtilityType.Electricity,
    billingMethod: UtilityBillingMethod.Metered,
    unit: "kWh",
    defaultUnitPrice: "3500",
  };

  it("returns an empty payload when nothing is dirty", () => {
    expect(buildUpdateUtilityServicePayload(values, {})).toEqual({});
  });

  it("includes only the dirty fields", () => {
    expect(
      buildUpdateUtilityServicePayload(values, {
        name: true,
        defaultUnitPrice: true,
      }),
    ).toEqual({ name: "Electricity", defaultUnitPrice: 3500 });
  });
});

describe("getMissingPresets", () => {
  const service = (
    type: UtilityService["type"],
    isActive = true,
  ): UtilityService => ({
    id: type,
    propertyId: "property-1",
    name: type,
    type,
    billingMethod: UtilityBillingMethod.Fixed,
    unit: "month",
    defaultUnitPrice: 0,
    isActive,
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: null,
  });

  it("returns every preset when the property has no services", () => {
    expect(getMissingPresets([]).map((p) => p.type)).toEqual([
      UtilityType.Electricity,
      UtilityType.Water,
      UtilityType.Internet,
      UtilityType.Garbage,
    ]);
  });

  it("leaves out presets whose type is already used, even by an inactive service", () => {
    expect(
      getMissingPresets([
        service(UtilityType.Electricity),
        service(UtilityType.Water, false),
        service(UtilityType.Other),
      ]).map((p) => p.type),
    ).toEqual([UtilityType.Internet, UtilityType.Garbage]);
  });

  it("returns nothing once every preset type is used", () => {
    expect(
      getMissingPresets([
        service(UtilityType.Electricity),
        service(UtilityType.Water),
        service(UtilityType.Internet),
        service(UtilityType.Garbage),
      ]),
    ).toEqual([]);
  });
});

describe("supportsQuantity", () => {
  it("allows a quantity only for fixed services", () => {
    expect(supportsQuantity(UtilityBillingMethod.Fixed)).toBe(true);
    expect(supportsQuantity(UtilityBillingMethod.Metered)).toBe(false);
    expect(supportsQuantity(UtilityBillingMethod.PerTenant)).toBe(false);
  });
});

describe("isDuplicateNameError", () => {
  it("matches the backend's duplicate-name conflict", () => {
    expect(
      isDuplicateNameError({
        status: 409,
        message:
          "A utility service with this name already exists in the property",
      }),
    ).toBe(true);
  });

  it("ignores other conflicts that mention a name", () => {
    expect(
      isDuplicateNameError({
        status: 409,
        message:
          "Service 'X' cannot change billing method: name is used by active leases",
      }),
    ).toBe(false);
  });
});
