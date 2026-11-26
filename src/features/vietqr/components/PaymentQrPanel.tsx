"use client";

import React from "react";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/button/Button";
import { downloadQrImage } from "@/features/vietqr/downloadQrImage";
import type { InvoicePaymentQr } from "@/features/vietqr/types";
import { QR_IMAGE_SIZE, useQrDataUrl } from "@/features/vietqr/useQrDataUrl";
import { formatCurrency } from "@/utils/currency";

async function copyToClipboard(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Couldn't copy the ${label.toLowerCase()}`);
  }
}

interface QrInfoRowProps {
  label: string;
  value: string;
  display?: React.ReactNode;
  copyable?: boolean;
}

const QrInfoRow: React.FC<QrInfoRowProps> = ({
  label,
  value,
  display,
  copyable = false,
}) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <div className="min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
        {display ?? value}
      </p>
    </div>
    {copyable && (
      <button
        type="button"
        aria-label={`Copy ${label.toLowerCase()}`}
        onClick={() => copyToClipboard(value, label)}
        className="hover:text-brand-500 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition dark:text-gray-400"
      >
        <Copy className="h-4 w-4" aria-hidden />
      </button>
    )}
  </div>
);

interface PaymentQrPanelProps {
  qr: InvoicePaymentQr;
  notice?: React.ReactNode;
  action?: React.ReactNode;
}

export const PaymentQrPanel: React.FC<PaymentQrPanelProps> = ({
  qr,
  notice,
  action,
}) => {
  const { dataUrl, error } = useQrDataUrl(qr.payload);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL, nothing for next/image to optimize
          <img
            src={dataUrl}
            alt={`VietQR code to pay ${qr.invoiceNumber}`}
            width={QR_IMAGE_SIZE}
            height={QR_IMAGE_SIZE}
            className="h-auto w-full max-w-[280px] rounded-lg border border-gray-200 dark:border-gray-800"
          />
        ) : (
          <div
            className="flex aspect-square w-full max-w-[280px] items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-700"
            role={error ? "alert" : undefined}
          >
            {error ? "Couldn't draw the QR code." : "Drawing QR code…"}
          </div>
        )}
      </div>

      {notice}

      <div className="divide-y divide-gray-100 dark:divide-white/5">
        <QrInfoRow label="Bank" value={qr.bankShortName} />
        <QrInfoRow label="Account number" value={qr.accountNumber} copyable />
        {qr.accountName && (
          <QrInfoRow label="Account holder" value={qr.accountName} />
        )}
        <QrInfoRow
          label="Amount"
          value={String(qr.amount)}
          display={formatCurrency(qr.amount)}
          copyable
        />
        <QrInfoRow
          label="Transfer content"
          value={qr.transferContent}
          copyable
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          size="sm"
          variant="outline"
          startIcon={<Download className="h-4 w-4" aria-hidden />}
          disabled={!dataUrl}
          onClick={() => dataUrl && downloadQrImage(qr, dataUrl)}
          className="flex-1"
        >
          Download PNG
        </Button>
        {action}
      </div>
    </div>
  );
};
