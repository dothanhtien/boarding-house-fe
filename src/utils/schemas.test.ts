import { describe, expect, it } from "vitest";
import { money } from "./schemas";

const errorsOf = (schema: ReturnType<typeof money>, value: string) => {
  const result = schema.safeParse(value);
  return result.success ? [] : result.error.issues.map((i) => i.message);
};

describe("money", () => {
  describe("required, zero not allowed", () => {
    const schema = money("Rent", { required: true, allowZero: false });

    it("accepts positive amounts with up to 2 decimal places", () => {
      expect(errorsOf(schema, "1")).toEqual([]);
      expect(errorsOf(schema, "3500000")).toEqual([]);
      expect(errorsOf(schema, "12.5")).toEqual([]);
      expect(errorsOf(schema, "12.34")).toEqual([]);
    });

    it("rejects an empty value", () => {
      expect(errorsOf(schema, "")).toEqual(["Rent is required"]);
    });

    it("rejects zero", () => {
      expect(errorsOf(schema, "0")).toContain("Rent must be greater than 0");
    });

    it("rejects negative amounts", () => {
      expect(errorsOf(schema, "-1")).toContain("Rent must be greater than 0");
    });

    it("rejects more than 2 decimal places", () => {
      expect(errorsOf(schema, "12.345")).toEqual([
        "Rent must have at most 2 decimal places",
      ]);
    });
  });

  describe("optional, zero allowed", () => {
    const schema = money("Deposit", { required: false, allowZero: true });

    it("accepts an empty value", () => {
      expect(errorsOf(schema, "")).toEqual([]);
    });

    it("accepts zero", () => {
      expect(errorsOf(schema, "0")).toEqual([]);
    });

    it("rejects negative amounts", () => {
      expect(errorsOf(schema, "-0.5")).toContain(
        "Deposit must not be negative",
      );
    });
  });

  describe("non-numeric and non-finite input", () => {
    const schema = money("Price", { required: false, allowZero: true });

    it.each(["abc", "1,5", "1.", ".5", "1e3", " 1", "Infinity"])(
      "rejects %j",
      (value) => {
        expect(errorsOf(schema, value)).not.toEqual([]);
      },
    );

    it("rejects digit strings that overflow to Infinity", () => {
      const overflowing = "1" + "0".repeat(400);
      expect(Number(overflowing)).toBe(Infinity);
      expect(errorsOf(schema, overflowing)).toContain(
        "Price must not be negative",
      );
    });
  });
});
