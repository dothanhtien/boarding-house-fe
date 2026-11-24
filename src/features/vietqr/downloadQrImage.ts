import { formatCurrency } from "@/utils/currency";
import type { InvoicePaymentQr } from "./types";
import { buildQrImageFileName } from "./utils";

const PADDING = 24;
const LINE_HEIGHT = 22;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function downloadQrImage(qr: InvoicePaymentQr, dataUrl: string) {
  const image = await loadImage(dataUrl);
  const lines = [
    qr.invoiceNumber,
    formatCurrency(qr.amount),
    `${qr.bankShortName} · ${qr.accountNumber}`,
    ...(qr.accountName ? [qr.accountName] : []),
    `Content: ${qr.transferContent}`,
  ];

  const canvas = document.createElement("canvas");
  canvas.width = image.width + PADDING * 2;
  canvas.height = image.height + PADDING * 2 + lines.length * LINE_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) return;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, PADDING, PADDING);
  context.fillStyle = "#1d2939";
  context.textAlign = "center";
  lines.forEach((line, index) => {
    context.font = index === 1 ? "bold 16px sans-serif" : "14px sans-serif";
    context.fillText(
      line,
      canvas.width / 2,
      image.height + PADDING + LINE_HEIGHT * (index + 1) - 4,
    );
  });

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = buildQrImageFileName(qr.invoiceNumber);
  link.click();
  URL.revokeObjectURL(url);
}
