"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useOverlay } from "@/hooks/useOverlay";

export interface ImageViewerItem {
  url: string;
  alt?: string;
}

interface ImageViewerProps {
  images: ImageViewerItem[];
  initialIndex?: number;
  title?: string;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  initialIndex = 0,
  title,
  onClose,
}) => {
  const [index, setIndex] = useState(initialIndex);
  const count = images.length;
  const current = images[index];

  const showPrevious = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count],
  );
  const showNext = useCallback(() => setIndex((i) => (i + 1) % count), [count]);

  useOverlay(true, onClose);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") showPrevious();
      else if (event.key === "ArrowRight") showNext();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showPrevious, showNext]);

  if (!current) return null;

  const navButtonClasses =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Image viewer"}
      className="fixed inset-0 z-99999 flex flex-col bg-gray-950/90"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 text-white sm:px-6">
        <p className="min-w-0 truncate text-sm font-medium">
          {title}
          {count > 1 && (
            <span className="ml-2 text-white/60">
              {index + 1} / {count}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
        <div
          className="relative h-[85%] w-full max-w-5xl"
          onClick={(event) => event.stopPropagation()}
        >
          <Image
            key={current.url}
            src={current.url}
            alt={current.alt ?? ""}
            fill
            unoptimized
            className="object-contain"
          />
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              aria-label="Previous image"
              className={`${navButtonClasses} left-2 sm:left-6`}
            >
              <ChevronLeft className="h-6 w-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="Next image"
              className={`${navButtonClasses} right-2 sm:right-6`}
            >
              <ChevronRight className="h-6 w-6" aria-hidden />
            </button>
          </>
        )}
      </div>

      {count > 1 ? (
        <ul
          className="flex justify-center gap-2 overflow-x-auto px-4 py-4"
          onClick={(event) => event.stopPropagation()}
        >
          {images.map((image, i) => (
            <li key={`${image.url}-${i}`} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
                className={`relative block h-14 w-14 cursor-pointer overflow-hidden rounded-md transition ${
                  i === index
                    ? "ring-2 ring-white"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="h-4" />
      )}
    </div>
  );
};
