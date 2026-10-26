import { describe, expect, it, vi } from "vitest";
import { applyApiFormErrors, toFormFieldPath } from "./formErrors";

describe("toFormFieldPath", () => {
  it.each([
    ["Name", "name"],
    ["name", "name"],
    ["DefaultUnitPrice", "defaultUnitPrice"],
    ["UtilityServices", "utilityServices"],
    ["UtilityServices[0]", "utilityServices.0"],
    ["UtilityServices[12].Quantity", "utilityServices.12.quantity"],
    ["Tenants[1].JoinedDate", "tenants.1.joinedDate"],
  ])("maps %s to %s", (apiField, path) => {
    expect(toFormFieldPath(apiField)).toBe(path);
  });
});

describe("applyApiFormErrors", () => {
  const setup = () => ({ setError: vi.fn(), setGeneralError: vi.fn() });

  it("sets nested field errors on the matching form path", () => {
    const { setError, setGeneralError } = setup();

    applyApiFormErrors(
      {
        status: 400,
        message: "One or more validation errors occurred.",
        errors: {
          Name: ["Name is required"],
          "UtilityServices[1].Quantity": ["Quantity must be greater than 0"],
        },
      },
      ["name", "utilityServices"],
      setError,
      setGeneralError,
      ["utilityServices.*.quantity"],
    );

    expect(setError).toHaveBeenCalledWith("name", {
      message: "Name is required",
    });
    expect(setError).toHaveBeenCalledWith("utilityServices.1.quantity", {
      message: "Quantity must be greater than 0",
    });
    expect(setGeneralError).not.toHaveBeenCalled();
  });

  it("falls back to the general error for unknown fields", () => {
    const { setError, setGeneralError } = setup();

    applyApiFormErrors(
      {
        status: 400,
        message: "One or more validation errors occurred.",
        errors: { RoomId: ["Room not found"] },
      },
      ["name"],
      setError,
      setGeneralError,
    );

    expect(setError).not.toHaveBeenCalled();
    expect(setGeneralError).toHaveBeenCalledWith("Room not found");
  });

  it("falls back to the general error for nested paths the form doesn't render", () => {
    const { setError, setGeneralError } = setup();

    applyApiFormErrors(
      {
        status: 400,
        message: "One or more validation errors occurred.",
        errors: { "Tenants[0].UserId": ["User not found"] },
      },
      ["tenants"],
      setError,
      setGeneralError,
      ["tenants.*.joinedDate"],
    );

    expect(setError).not.toHaveBeenCalled();
    expect(setGeneralError).toHaveBeenCalledWith("User not found");
  });

  it("uses the error message when there are no field errors", () => {
    const { setError, setGeneralError } = setup();

    applyApiFormErrors(
      { status: 409, message: "Conflict" },
      ["name"],
      setError,
      setGeneralError,
    );

    expect(setGeneralError).toHaveBeenCalledWith("Conflict");
  });
});
