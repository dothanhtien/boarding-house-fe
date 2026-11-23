"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ROUTES } from "@/config/routeDefinition";
import { HttpStatus } from "@/enums/httpStatus";
import { invoicesApi } from "@/features/invoices/api";
import {
  INVOICE_PREVIEW_DEBOUNCE_MS,
  InvoiceStatus,
} from "@/features/invoices/constants";
import { useCreateInvoice } from "@/features/invoices/mutations";
import { invoiceKeys, useInvoicePreview } from "@/features/invoices/queries";
import {
  createInvoiceSchema,
  type CreateInvoiceFormValues,
} from "@/features/invoices/schemas";
import type {
  CreateInvoicePayload,
  InvoiceDetail,
} from "@/features/invoices/types";
import {
  getDefaultInvoiceMonth,
  toCreateInvoicePayload,
} from "@/features/invoices/utils";
import type { Lease } from "@/features/leases/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ApiError } from "@/lib/axios";
import { CustomItemsFields } from "./CustomItemsFields";
import { formatLeaseOption, InvoiceLeaseSelect } from "./InvoiceLeaseSelect";
import { InvoiceMonthSelect } from "./InvoiceMonthSelect";
import { InvoicePreviewPanel } from "./InvoicePreviewPanel";

type SubmitProblem = { payloadKey: string } & (
  | { kind: "alreadyInvoiced"; existingInvoiceId: string | null }
  | { kind: "messages"; messages: string[] }
);

const linkClassName = "text-brand-500 hover:text-brand-600 hover:underline";

async function findLiveInvoiceId(payload: CreateInvoicePayload) {
  try {
    const result = await invoicesApi.getInvoices({
      leaseId: payload.leaseId,
      billingMonth: payload.billingMonth,
      pageSize: 10,
    });
    return (
      result.items.find((invoice) => invoice.status !== InvoiceStatus.Cancelled)
        ?.id ?? null
    );
  } catch {
    return null;
  }
}

interface CreateInvoiceFormProps {
  lease?: Lease;
  onCreated: (invoice: InvoiceDetail) => void;
  onCancel?: () => void;
  onPendingChange?: (isPending: boolean) => void;
  stickyTopClassName?: string;
  idPrefix?: string;
}

export const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({
  lease,
  onCreated,
  onCancel,
  onPendingChange,
  stickyTopClassName = "lg:top-24",
  idPrefix = "invoice",
}) => {
  const queryClient = useQueryClient();
  const createInvoiceMutation = useCreateInvoice();
  const isPending = createInvoiceMutation.isPending;
  const [submitProblem, setSubmitProblem] = useState<SubmitProblem | null>(
    null,
  );

  const form = useForm<CreateInvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      leaseId: lease?.id ?? "",
      month: getDefaultInvoiceMonth(),
      customItems: [],
      discountAmount: "",
      discountReason: "",
      notes: "",
    },
    mode: "all",
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const values = useWatch({ control }) as CreateInvoiceFormValues;
  const parsed = createInvoiceSchema.safeParse(values);
  const candidateKey = parsed.success
    ? JSON.stringify(toCreateInvoicePayload(parsed.data))
    : null;
  const debouncedKey = useDebouncedValue(
    candidateKey,
    INVOICE_PREVIEW_DEBOUNCE_MS,
  );
  const previewPayload = useMemo<CreateInvoicePayload | null>(
    () => (debouncedKey ? JSON.parse(debouncedKey) : null),
    [debouncedKey],
  );
  const preview = useInvoicePreview(previewPayload);

  const isPreviewCurrent =
    candidateKey !== null &&
    debouncedKey === candidateKey &&
    preview.isSuccess &&
    !preview.isPlaceholderData &&
    !preview.isFetching;
  const canSubmit = isPreviewCurrent && !!preview.data?.canCreate && !isPending;
  const shownPreview =
    candidateKey !== null && !preview.isError ? preview.data : undefined;
  const shownProblem =
    submitProblem?.payloadKey === candidateKey ? submitProblem : null;

  const onSubmit = () => {
    if (!canSubmit || !previewPayload || !debouncedKey) return;
    const payloadKey = debouncedKey;
    setSubmitProblem(null);
    onPendingChange?.(true);

    createInvoiceMutation.mutate(previewPayload, {
      onSuccess: onCreated,
      onError: async (error: ApiError) => {
        if (error.status === HttpStatus.Conflict) {
          setSubmitProblem({
            payloadKey,
            kind: "alreadyInvoiced",
            existingInvoiceId: null,
          });
          const existingInvoiceId = await findLiveInvoiceId(previewPayload);
          setSubmitProblem((current) =>
            current?.payloadKey === payloadKey
              ? { payloadKey, kind: "alreadyInvoiced", existingInvoiceId }
              : current,
          );
        } else {
          const messages = error.errors
            ? Object.values(error.errors).flat()
            : [];
          setSubmitProblem({
            payloadKey,
            kind: "messages",
            messages: messages.length > 0 ? messages : [error.message],
          });
        }
        queryClient.invalidateQueries({ queryKey: invoiceKeys.previews() });
      },
      onSettled: () => onPendingChange?.(false),
    });
  };

  const leaseFieldId = `${idPrefix}Lease`;
  const monthFieldId = `${idPrefix}Month`;
  const discountAmountId = `${idPrefix}DiscountAmount`;
  const discountReasonId = `${idPrefix}DiscountReason`;
  const notesId = `${idPrefix}Notes`;

  return (
    <FormProvider {...form}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor={leaseFieldId}>
                  Lease <span className="text-red-500">*</span>
                </Label>
                {lease ? (
                  <Input
                    id={leaseFieldId}
                    defaultValue={formatLeaseOption(lease)}
                    disabled
                  />
                ) : (
                  <Controller
                    name="leaseId"
                    control={control}
                    render={({ field }) => (
                      <InvoiceLeaseSelect
                        id={leaseFieldId}
                        value={field.value}
                        onChange={field.onChange}
                        error={!!errors.leaseId}
                      />
                    )}
                  />
                )}
                {errors.leaseId && (
                  <p className="text-error-500 mt-1.5 text-xs">
                    {errors.leaseId.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={monthFieldId}>
                  Billing month <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="month"
                  control={control}
                  render={({ field }) => (
                    <InvoiceMonthSelect
                      id={monthFieldId}
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.month}
                    />
                  )}
                />
              </div>
            </div>

            <CustomItemsFields disabled={isPending} />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor={discountAmountId}>Discount</Label>
                <Input
                  id={discountAmountId}
                  inputMode="decimal"
                  placeholder="0"
                  disabled={isPending}
                  error={!!errors.discountAmount}
                  hint={errors.discountAmount?.message}
                  {...register("discountAmount")}
                />
              </div>
              <div>
                <Label htmlFor={discountReasonId}>Discount reason</Label>
                <Input
                  id={discountReasonId}
                  disabled={isPending}
                  error={!!errors.discountReason}
                  hint={errors.discountReason?.message}
                  {...register("discountReason")}
                />
              </div>
            </div>

            <div>
              <Label htmlFor={notesId}>Notes</Label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextArea
                    id={notesId}
                    rows={3}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    error={!!errors.notes}
                    hint={errors.notes?.message}
                  />
                )}
              />
            </div>
          </div>

          <div
            className={`flex flex-col gap-4 lg:sticky lg:self-start ${stickyTopClassName}`}
          >
            <InvoicePreviewPanel
              preview={shownPreview}
              isUpdating={
                !!shownPreview &&
                (preview.isFetching || debouncedKey !== candidateKey)
              }
              error={
                candidateKey !== null ? (preview.error?.message ?? null) : null
              }
              isWaitingForInput={candidateKey === null}
            />

            {shownProblem?.kind === "alreadyInvoiced" && (
              <div
                role="alert"
                className="border-error-500/30 bg-error-50 dark:bg-error-500/15 rounded-lg border px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
              >
                This lease already has an invoice for this month.{" "}
                {shownProblem.existingInvoiceId && (
                  <Link
                    href={ROUTES.invoiceDetail(shownProblem.existingInvoiceId)}
                    className={linkClassName}
                  >
                    View invoice
                  </Link>
                )}
              </div>
            )}

            {shownProblem?.kind === "messages" && (
              <div
                role="alert"
                className="border-error-500/30 bg-error-50 dark:bg-error-500/15 rounded-lg border px-4 py-3"
              >
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  The invoice was not created:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-400">
                  {shownProblem.messages.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={!canSubmit} className="flex-1">
                {isPending ? "Creating..." : "Create invoice"}
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </FormProvider>
  );
};
