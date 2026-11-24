import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { RoleSlugs } from "@/enums/roles";
import { InvoiceStatus } from "@/features/invoices/constants";
import type { Invoice } from "@/features/invoices/types";
import type { Lease, LeaseTenant } from "@/features/leases/types";
import { OTHER_PAYER, PaymentMethod, PaymentStatus } from "./constants";
import type { RecordPaymentFormValues } from "./schemas";
import type { Payment } from "./types";
import {
  canConfirmPayment,
  canRecordPayment,
  canVoidPayment,
  getPayerOptions,
  isDateRangeValid,
  sumConfirmed,
  sumPending,
  toPaymentDate,
  toRecordPaymentPayload,
  toTransferContent,
} from "./utils";

const invoice = (overrides: Partial<Invoice> = {}) =>
  ({
    id: "invoice-1",
    status: InvoiceStatus.Pending,
    totalAmount: 3_000_000,
    paidAmount: 0,
    remainingAmount: 3_000_000,
    ...overrides,
  }) as Invoice;

const payment = (overrides: Partial<Payment> = {}) =>
  ({
    id: "payment-1",
    invoiceId: "invoice-1",
    amount: 1_000_000,
    method: PaymentMethod.Cash,
    status: PaymentStatus.Pending,
    ...overrides,
  }) as Payment;

const tenant = (overrides: Partial<LeaseTenant> = {}): LeaseTenant => ({
  id: "lt-1",
  userId: "user-1",
  fullName: "An Nguyen",
  phone: null,
  isRepresentative: false,
  joinedDate: null,
  leftDate: null,
  ...overrides,
});

const lease = {
  id: "lease-1",
  tenants: [
    tenant({ id: "lt-2", userId: "user-2", fullName: "Binh Tran" }),
    tenant({ isRepresentative: true }),
    tenant({
      id: "lt-3",
      userId: "user-3",
      fullName: "Chi Le",
      leftDate: "2026-06-30",
    }),
  ],
} as Lease;

describe("canRecordPayment", () => {
  it("needs at least 1 đồng left on a non-cancelled invoice", () => {
    expect(canRecordPayment(invoice())).toBe(true);
    expect(
      canRecordPayment(
        invoice({ status: InvoiceStatus.Overdue, remainingAmount: 10 }),
      ),
    ).toBe(true);
    expect(canRecordPayment(invoice({ status: InvoiceStatus.Cancelled }))).toBe(
      false,
    );
    expect(
      canRecordPayment(
        invoice({ status: InvoiceStatus.Paid, remainingAmount: 0 }),
      ),
    ).toBe(false);
    expect(canRecordPayment(invoice({ remainingAmount: 0.5 }))).toBe(false);
  });
});

describe("canConfirmPayment / canVoidPayment", () => {
  it("only confirms pending payments", () => {
    expect(canConfirmPayment(payment())).toBe(true);
    expect(
      canConfirmPayment(payment({ status: PaymentStatus.Confirmed })),
    ).toBe(false);
  });

  it("only lets admins void payments that aren't voided yet", () => {
    const admin = RoleSlugs.OrganizationAdmin;
    expect(canVoidPayment(RoleSlugs.OrganizationStaff, payment())).toBe(false);
    expect(canVoidPayment(admin, payment())).toBe(true);
    expect(
      canVoidPayment(admin, payment({ status: PaymentStatus.Confirmed })),
    ).toBe(true);
    expect(
      canVoidPayment(admin, payment({ status: PaymentStatus.Voided })),
    ).toBe(false);
  });
});

describe("toPaymentDate", () => {
  const now = dayjs("2026-07-10T09:30:15");

  it("uses the current time for today", () => {
    expect(toPaymentDate("2026-07-10", now)).toBe(now.toISOString());
  });

  it("uses noon local time for an earlier day", () => {
    const sent = toPaymentDate("2026-07-07", now);
    expect(dayjs(sent).format("YYYY-MM-DD HH:mm")).toBe("2026-07-07 12:00");
  });
});

describe("toTransferContent", () => {
  it("strips separators and caps the length", () => {
    expect(toTransferContent("INV-202611-0001")).toBe("INV2026110001");
    expect(toTransferContent("inv-2026-abc")).toBe("INV2026ABC");
    expect(toTransferContent("X".repeat(30))).toHaveLength(25);
  });
});

describe("getPayerOptions", () => {
  it("puts the representative first and ends with someone else", () => {
    expect(getPayerOptions(lease)).toEqual([
      { value: "user-1", label: "An Nguyen (representative)" },
      { value: "user-2", label: "Binh Tran" },
      { value: "user-3", label: "Chi Le (moved out)" },
      { value: OTHER_PAYER, label: "Someone else…" },
    ]);
  });

  it("only offers someone else without a lease", () => {
    expect(getPayerOptions(undefined)).toEqual([
      { value: OTHER_PAYER, label: "Someone else…" },
    ]);
  });
});

describe("toRecordPaymentPayload", () => {
  const now = dayjs("2026-07-10T09:30:00");
  const values = (
    overrides: Partial<RecordPaymentFormValues> = {},
  ): RecordPaymentFormValues => ({
    amount: "1500000",
    method: PaymentMethod.Cash,
    receivedOn: "2026-07-10",
    payer: "user-1",
    payerNameOverride: "",
    transactionReference: "FT123",
    note: "  ",
    confirm: true,
    ...overrides,
  });

  it("leaves the payer to the backend for the representative", () => {
    expect(toRecordPaymentPayload(values(), lease, now)).toEqual({
      amount: 1_500_000,
      method: PaymentMethod.Cash,
      paymentDate: now.toISOString(),
      confirm: true,
    });
  });

  it("sends another tenant as payerUserId", () => {
    const payload = toRecordPaymentPayload(
      values({ payer: "user-2" }),
      lease,
      now,
    );
    expect(payload.payerUserId).toBe("user-2");
    expect(payload).not.toHaveProperty("payerNameOverride");
  });

  it("sends a trimmed name for someone else", () => {
    const payload = toRecordPaymentPayload(
      values({ payer: OTHER_PAYER, payerNameOverride: "  Mẹ của An " }),
      lease,
      now,
    );
    expect(payload.payerNameOverride).toBe("Mẹ của An");
    expect(payload).not.toHaveProperty("payerUserId");
  });

  it("only sends the reference for bank transfers", () => {
    expect(
      toRecordPaymentPayload(
        values({ method: PaymentMethod.BankTransfer, confirm: false }),
        lease,
        now,
      ),
    ).toMatchObject({ transactionReference: "FT123", confirm: false });
  });
});

describe("sumConfirmed / sumPending", () => {
  const payments = [
    payment({ amount: 100, status: PaymentStatus.Confirmed }),
    payment({ amount: 200, status: PaymentStatus.Pending }),
    payment({ amount: 400, status: PaymentStatus.Voided }),
    payment({ amount: 800, status: PaymentStatus.Confirmed }),
  ];

  it("ignores voided payments", () => {
    expect(sumConfirmed(payments)).toBe(900);
    expect(sumPending(payments)).toBe(200);
  });
});

describe("isDateRangeValid", () => {
  it("rejects only a `to` before `from`", () => {
    expect(isDateRangeValid("", "")).toBe(true);
    expect(isDateRangeValid("2026-07-01", "")).toBe(true);
    expect(isDateRangeValid("2026-07-01", "2026-07-01")).toBe(true);
    expect(isDateRangeValid("2026-07-02", "2026-07-01")).toBe(false);
  });
});
