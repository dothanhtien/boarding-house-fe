"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import DatePicker from "@/components/form/DatePicker";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { InvoiceItemSourceType } from "@/features/invoices/constants";
import { useUpdateInvoice } from "@/features/invoices/mutations";
import {
  editInvoiceSchema,
  type EditInvoiceFormValues,
} from "@/features/invoices/schemas";
import type { InvoiceDetail } from "@/features/invoices/types";
import {
  buildInvoicePatch,
  toEditInvoiceFormValues,
} from "@/features/invoices/utils";
import type { ApiError } from "@/lib/axios";
import { DateFormat } from "@/utils/date";
import { applyApiFormErrors } from "@/utils/formErrors";
import { CustomItemsFields } from "./CustomItemsFields";
import { InvoiceLinesTable } from "./InvoiceLinesTable";

interface EditInvoiceModalProps {
  invoice: InvoiceDetail;
  onClose: () => void;
}

const FORM_FIELDS: (keyof EditInvoiceFormValues)[] = [
  "dueDate",
  "discountAmount",
  "discountReason",
  "notes",
];

export const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  invoice,
  onClose,
}) => {
  const [initialInvoice] = useState(invoice);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const updateInvoiceMutation = useUpdateInvoice();
  const isPending = updateInvoiceMutation.isPending;
  const form = useForm<EditInvoiceFormValues>({
    resolver: zodResolver(editInvoiceSchema),
    defaultValues: toEditInvoiceFormValues(initialInvoice),
    mode: "all",
  });
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  const generatedLines = invoice.items.filter(
    (item) => item.sourceType !== InvoiceItemSourceType.Custom,
  );
  const dueDate = useWatch({ control, name: "dueDate" });
  const isDueDatePast = !!dueDate && dueDate < dayjs().format(DateFormat.Date);

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const onSubmit = (values: EditInvoiceFormValues) => {
    setGeneralError(null);
    const payload = buildInvoicePatch(initialInvoice, values);
    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    updateInvoiceMutation.mutate(
      { id: invoice.id, payload },
      {
        onSuccess: () => {
          toast.success(`Invoice ${invoice.invoiceNumber} updated`);
          onClose();
        },
        onError: (error: ApiError) => {
          // Custom item errors are indexed by change, not by form row, so
          // they fall through to the general message.
          applyApiFormErrors(error, FORM_FIELDS, setError, setGeneralError);
        },
      },
    );
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      className="m-4 max-w-[760px]"
      closeOnBackdropClick={false}
    >
      <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl bg-white dark:bg-gray-900">
        <h4 className="shrink-0 px-6 pt-6 pr-16 pb-2 text-xl font-semibold text-gray-800 lg:px-8 lg:pt-8 lg:pr-20 dark:text-white/90">
          Edit invoice {invoice.invoiceNumber}
        </h4>
        <div className="overflow-y-auto px-6 pb-6 lg:px-8 lg:pb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rent, utilities and deposit lines are calculated from the lease and
            can&apos;t be edited. Cancel the invoice and create it again to
            recalculate them.
          </p>

          <FormProvider {...form}>
            <Form onSubmit={handleSubmit(onSubmit)} className="mt-6">
              <div className="flex flex-col gap-6">
                {generalError && (
                  <p className="text-error-500 text-sm">{generalError}</p>
                )}

                {generatedLines.length > 0 && (
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                    <InvoiceLinesTable lines={generatedLines} />
                  </div>
                )}

                <CustomItemsFields disabled={isPending} />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="editDiscountAmount">Discount</Label>
                    <Input
                      id="editDiscountAmount"
                      inputMode="decimal"
                      placeholder="0"
                      disabled={isPending}
                      error={!!errors.discountAmount}
                      hint={errors.discountAmount?.message}
                      {...register("discountAmount")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editDiscountReason">Discount reason</Label>
                    <Input
                      id="editDiscountReason"
                      disabled={isPending}
                      error={!!errors.discountReason}
                      hint={errors.discountReason?.message}
                      {...register("discountReason")}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="editDueDate">
                    Due date <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        id="editDueDate"
                        placeholder="Select a date"
                        value={field.value}
                        onChange={(_, dateStr) => field.onChange(dateStr)}
                        onBlur={field.onBlur}
                        disabled={isPending}
                        error={!!errors.dueDate}
                        hint={
                          errors.dueDate?.message ??
                          (isDueDatePast
                            ? "This date has passed: the invoice will become overdue right away."
                            : undefined)
                        }
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="editNotes">Notes</Label>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        id="editNotes"
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
                  {isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </Form>
          </FormProvider>
        </div>
      </div>
    </Modal>
  );
};
