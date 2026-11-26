"use client";

import React from "react";
import { PaymentQrPanel } from "@/features/vietqr/components/PaymentQrPanel";
import {
  isBankNotConfiguredError,
  isQrAvailable,
} from "@/features/vietqr/utils";
import { useMyInvoicePaymentQr } from "../queries";
import type { MyInvoice } from "../types";
import { PortalSection } from "./ui/PortalSection";

interface MyInvoicePaymentQrCardProps {
  invoice: MyInvoice;
}

export const MyInvoicePaymentQrCard: React.FC<MyInvoicePaymentQrCardProps> = ({
  invoice,
}) => {
  const isAvailable = isQrAvailable(invoice);
  const {
    data: qr,
    isLoading,
    error,
  } = useMyInvoicePaymentQr(invoice.id, { enabled: isAvailable });

  if (!isAvailable) return null;

  return (
    <PortalSection title="Pay by bank transfer">
      {isLoading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      )}
      {error &&
        (isBankNotConfiguredError(error) ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bank transfer isn&apos;t available for this invoice. Please contact
            your landlord.
          </p>
        ) : (
          <p className="text-error-500 text-sm">{error.message}</p>
        ))}
      {qr && !error && (
        <PaymentQrPanel
          qr={qr}
          notice={
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Scan with your banking app. Keep the transfer content as it is so
              your landlord can match the payment.
            </p>
          }
        />
      )}
    </PortalSection>
  );
};
