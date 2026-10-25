import { describe, expect, it } from "vitest";
import type { LeaseTenant } from "./types";
import type { LeaseTenantFormValue } from "./schemas";
import { buildTenantChanges } from "./utils";

const tenant = (overrides: Partial<LeaseTenant> = {}): LeaseTenant => ({
  id: "tenant-1",
  userId: "user-1",
  fullName: "Spider Man",
  phone: "0987654321",
  isRepresentative: true,
  joinedDate: null,
  leftDate: null,
  ...overrides,
});

const toFormValue = (
  t: LeaseTenant,
  overrides: Partial<LeaseTenantFormValue> = {},
) => ({
  tenantId: t.id,
  userId: t.userId,
  fullName: t.fullName,
  phone: t.phone ?? "",
  isRepresentative: t.isRepresentative,
  joinedDate: t.joinedDate ?? "",
  ...overrides,
});

describe("buildTenantChanges", () => {
  it("returns no changes when nothing was edited", () => {
    const original = [tenant()];

    expect(
      buildTenantChanges(
        original,
        original.map((t) => toFormValue(t)),
      ),
    ).toEqual([]);
  });

  it("treats an empty joined date as unchanged when the original is null", () => {
    const original = [tenant({ joinedDate: null })];

    expect(
      buildTenantChanges(original, [
        toFormValue(original[0], { joinedDate: "" }),
      ]),
    ).toEqual([]);
  });

  it("adds new rows with their userId and a null joined date when blank", () => {
    const changes = buildTenantChanges(
      [],
      [
        {
          userId: "user-2",
          fullName: "Doctor Strange",
          phone: "",
          isRepresentative: false,
          joinedDate: "",
        },
      ],
    );

    expect(changes).toEqual([
      { userId: "user-2", isRepresentative: false, joinedDate: null },
    ]);
  });

  it("sends only the fields that changed on existing rows", () => {
    const original = [tenant({ isRepresentative: true, joinedDate: null })];

    const changes = buildTenantChanges(original, [
      toFormValue(original[0], { joinedDate: "2026-11-01" }),
    ]);

    expect(changes).toEqual([{ id: "tenant-1", joinedDate: "2026-11-01" }]);
  });

  it("sends a null joined date when it is cleared", () => {
    const original = [tenant({ joinedDate: "2026-11-01" })];

    const changes = buildTenantChanges(original, [
      toFormValue(original[0], { joinedDate: "" }),
    ]);

    expect(changes).toEqual([{ id: "tenant-1", joinedDate: null }]);
  });

  it("flags removed rows as deleted, before the other changes", () => {
    const a = tenant({
      id: "tenant-1",
      userId: "user-1",
      isRepresentative: true,
    });
    const b = tenant({
      id: "tenant-2",
      userId: "user-2",
      isRepresentative: false,
    });

    const changes = buildTenantChanges(
      [a, b],
      [
        toFormValue(b, { isRepresentative: true }),
        {
          userId: "user-3",
          fullName: "Hulk",
          phone: "",
          isRepresentative: false,
          joinedDate: "",
        },
      ],
    );

    expect(changes).toEqual([
      { id: "tenant-1", isDeleted: true },
      { id: "tenant-2", isRepresentative: true },
      { userId: "user-3", isRepresentative: false, joinedDate: null },
    ]);
  });

  it("matches by tenantId before falling back to userId", () => {
    const earlier = tenant({
      id: "tenant-1",
      userId: "user-1",
      isRepresentative: false,
    });
    const current = tenant({
      id: "tenant-2",
      userId: "user-1",
      isRepresentative: true,
    });

    const changes = buildTenantChanges(
      [earlier, current],
      [toFormValue(current)],
    );

    expect(changes).toEqual([{ id: "tenant-1", isDeleted: true }]);
  });

  it("reuses the existing record when a removed tenant is added back", () => {
    const original = tenant({ id: "tenant-1", userId: "user-1" });

    const changes = buildTenantChanges(
      [original],
      [toFormValue(original, { tenantId: undefined, isRepresentative: false })],
    );

    expect(changes).toEqual([{ id: "tenant-1", isRepresentative: false }]);
  });

  it("treats a row whose tenantId is not on the lease as a new tenant", () => {
    const changes = buildTenantChanges(
      [],
      [toFormValue(tenant({ id: "unknown", userId: "user-9" }))],
    );

    expect(changes).toEqual([
      { userId: "user-9", isRepresentative: true, joinedDate: null },
    ]);
  });

  it("demotes the old representative before promoting the new one", () => {
    const a = tenant({
      id: "tenant-1",
      userId: "user-1",
      isRepresentative: true,
    });
    const b = tenant({
      id: "tenant-2",
      userId: "user-2",
      isRepresentative: false,
    });

    const changes = buildTenantChanges(
      [a, b],
      [
        toFormValue(b, { isRepresentative: true }),
        toFormValue(a, { isRepresentative: false }),
      ],
    );

    expect(changes).toEqual([
      { id: "tenant-1", isRepresentative: false },
      { id: "tenant-2", isRepresentative: true },
    ]);
  });

  it("matches each existing record to at most one row", () => {
    const original = tenant({ id: "tenant-1", userId: "user-1" });
    const readded = toFormValue(original, { tenantId: undefined });

    const changes = buildTenantChanges([original], [readded, readded]);

    expect(changes).toEqual([
      { userId: "user-1", isRepresentative: true, joinedDate: null },
    ]);
  });
});
