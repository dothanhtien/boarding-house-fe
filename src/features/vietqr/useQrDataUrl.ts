"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export const QR_IMAGE_SIZE = 280;

type QrState = { payload: string; dataUrl: string | null; error: boolean };

export function useQrDataUrl(payload: string | undefined) {
  const [state, setState] = useState<QrState | null>(null);

  useEffect(() => {
    if (!payload) return;
    let isCurrent = true;

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: QR_IMAGE_SIZE,
    })
      .then((dataUrl) => {
        if (isCurrent) setState({ payload, dataUrl, error: false });
      })
      .catch(() => {
        if (isCurrent) setState({ payload, dataUrl: null, error: true });
      });

    return () => {
      isCurrent = false;
    };
  }, [payload]);

  const isForPayload = !!payload && state?.payload === payload;
  return {
    dataUrl: isForPayload ? state.dataUrl : null,
    error: isForPayload ? state.error : false,
  };
}
