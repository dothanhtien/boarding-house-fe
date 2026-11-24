"use client";

import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import DatePicker from "@/components/form/DatePicker";
import Form from "@/components/form/Form";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Radio from "@/components/form/input/Radio";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import { Select } from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { HttpStatus } from "@/enums/httpStatus";
import type { Invoice } from "@/features/invoices/types";
import { useLease } from "@/features/leases/queries";
import {
  OTHER_PAYER,
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  RECORDABLE_PAYMENT_METHODS,
} from "@/features/payments/constants";
import { useRecordPayment } from "@/features/payments/mutations";
import {
  buildRecordPaymentSchema,
  type RecordPaymentFormValues,
} from "@/features/payments/schemas";
import {
  getPayerOptions,
  getRecordableAmount,
  getRepresentative,
  toRecordPaymentPayload,
  toTransferContent,
} from "@/features/payments/utils";
import type { ApiError } from "@/lib/axios";
import { formatCurrency } from "@/utils/currency";
import { DateFormat } from "@/utils/date";
import { applyApiFormErrors } from "@/utils/formErrors";

interface RecordPaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
  defaultValues?: Partial<
    Pick<RecordPaymentFormValues, "amount" | "method" | "confirm">
  >;
}

const FORM_FIELDS: (keyof RecordPaymentFormValues)[] = [
  "amount",
  "method",
  "payerNameOverride",
  "transactionReference",
  "note",
];

const isCash = (method: string) => method === PaymentMethod.Cash;

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  invoice,
  onClose,
  defaultValues,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isConfirmTouched, setIsConfirmTouched] = useState(
    defaultValues?.confirm !== undefined,
  );
  const recordPaymentMutation = useRecordPayment();
  const isPending = recordPaymentMutation.isPending;
  const { data: lease } = useLease(invoice.leaseId);

  const maxAmount = getRecordableAmount(invoice);
  const today = dayjs().format(DateFormat.Date);
  const schema = useMemo(
    () => buildRecordPaymentSchema(maxAmount, today),
    [maxAmount, today],
  );
  const initialMethod = defaultValues?.method ?? PaymentMethod.Cash;
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: defaultValues?.amount ?? String(maxAmount),
      method: initialMethod,
      receivedOn: today,
      payer: "",
      payerNameOverride: "",
      transactionReference: "",
      note: "",
      confirm: defaultValues?.confirm ?? isCash(initialMethod),
    },
    mode: "all",
  });
  const method = useWatch({ control, name: "method" });
  const payer = useWatch({ control, name: "payer" });

  const representative = getRepresentative(lease);
  const payerOptions = getPayerOptions(lease).filter(
    (option) => option.value !== representative?.userId,
  );

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleMethodChange = (next: string) => {
    setValue("method", next as RecordPaymentFormValues["method"], {
      shouldValidate: true,
    });
    if (!isConfirmTouched) setValue("confirm", isCash(next));
  };

  const onSubmit = (values: RecordPaymentFormValues) => {
    setGeneralError(null);
    const payload = toRecordPaymentPayload(values, lease);

    recordPaymentMutation.mutate(
      { invoiceId: invoice.id, payload },
      {
        onSuccess: (payment) => {
          toast.success(
            `Payment of ${formatCurrency(payment.amount)} recorded${
              values.confirm ? " and confirmed" : ""
            }`,
          );
          onClose();
        },
        onError: (error: ApiError) => {
          if (error.status === HttpStatus.Forbidden) {
            setGeneralError(
              "You don't have permission to confirm payments. Uncheck “Mark as confirmed” to record it as pending.",
            );
            return;
          }
          applyApiFormErrors(error, FORM_FIELDS, setError, setGeneralError);
        },
      },
    );
  };

  return (
    <Modal
      isOpen
      labelledBy="recordPaymentTitle"
      onClose={handleClose}
      className="m-4 max-w-[560px]"
      closeOnBackdropClick={false}
    >
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4
          id="recordPaymentTitle"
          className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90"
        >
          Record payment
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Invoice{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {invoice.invoiceNumber}
          </span>{" "}
          · Room {invoice.roomNumber}
        </p>

        <Form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <div className="flex flex-col gap-5">
            {generalError && (
              <p role="alert" className="text-error-500 text-sm">
                {generalError}
              </p>
            )}

            <div>
              <Label htmlFor="paymentAmount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    id="paymentAmount"
                    inputMode="numeric"
                    disabled={isPending}
                    error={!!errors.amount}
                    hint={
                      errors.amount?.message ??
                      `Remaining: ${formatCurrency(invoice.remainingAmount)}`
                    }
                    {...register("amount")}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-11 shrink-0"
                  disabled={isPending}
                  onClick={() =>
                    setValue("amount", String(maxAmount), {
                      shouldValidate: true,
                    })
                  }
                >
                  Full remaining
                </Button>
              </div>
            </div>

            <div>
              <Label>Method</Label>
              <div className="flex flex-wrap gap-6">
                {RECORDABLE_PAYMENT_METHODS.map((value) => (
                  <Radio
                    key={value}
                    id={`paymentMethod-${value}`}
                    name="paymentMethod"
                    value={value}
                    label={PAYMENT_METHOD_LABELS[value]}
                    checked={method === value}
                    disabled={isPending}
                    onChange={handleMethodChange}
                  />
                ))}
              </div>
            </div>

            {method === PaymentMethod.BankTransfer && (
              <div>
                <Label htmlFor="transactionReference">
                  Transaction reference
                </Label>
                <Input
                  id="transactionReference"
                  placeholder="Bank transaction ID"
                  disabled={isPending}
                  error={!!errors.transactionReference}
                  hint={
                    errors.transactionReference?.message ??
                    `Transfer content to look for: ${toTransferContent(invoice.invoiceNumber)}`
                  }
                  {...register("transactionReference")}
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="receivedOn">
                  Received on <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="receivedOn"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="receivedOn"
                      placeholder="Select a date"
                      value={field.value}
                      maxDate={today}
                      onChange={(_, dateStr) => field.onChange(dateStr)}
                      onBlur={field.onBlur}
                      disabled={isPending}
                      error={!!errors.receivedOn}
                      hint={errors.receivedOn?.message}
                    />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="payer">Paid by</Label>
                <Controller
                  name="payer"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="payer"
                      options={payerOptions}
                      placeholder={
                        representative
                          ? `${representative.fullName} (representative)`
                          : "Lease representative"
                      }
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            {payer === OTHER_PAYER && (
              <div>
                <Label htmlFor="payerNameOverride">
                  Payer name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="payerNameOverride"
                  disabled={isPending}
                  error={!!errors.payerNameOverride}
                  hint={errors.payerNameOverride?.message}
                  {...register("payerNameOverride")}
                />
              </div>
            )}

            <div>
              <Label htmlFor="paymentNote">Note</Label>
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <TextArea
                    id="paymentNote"
                    rows={2}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    error={!!errors.note}
                    hint={errors.note?.message}
                  />
                )}
              />
            </div>

            <Controller
              name="confirm"
              control={control}
              render={({ field }) => (
                <div>
                  <Checkbox
                    id="confirmPayment"
                    label="Mark as confirmed"
                    checked={field.value}
                    disabled={isPending}
                    onChange={(checked) => {
                      setIsConfirmTouched(true);
                      field.onChange(checked);
                    }}
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {field.value
                      ? "The money counts towards the invoice right away."
                      : "Saved as pending until someone confirms it, e.g. after checking the bank statement."}
                  </p>
                </div>
              )}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button disabled={isPending}>
              {isPending ? "Saving..." : "Record payment"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
