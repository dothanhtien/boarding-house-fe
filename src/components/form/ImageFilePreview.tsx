"use client";

import React from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageFilePreviewProps {
  file: File;
  src: string | undefined;
  onRemove: () => void;
  disabled?: boolean;
  badge?: React.ReactNode;
  className?: string;
}

export const ImageFilePreview: React.FC<ImageFilePreviewProps> = ({
  file,
  src,
  onRemove,
  disabled = false,
  badge,
  className = "border border-gray-200 dark:border-gray-800",
}) => (
  <li
    className={`relative aspect-square overflow-hidden rounded-lg ${className}`}
  >
    {src && (
      <Image
        src={src}
        alt={file.name}
        fill
        unoptimized
        className="object-cover"
      />
    )}
    {badge}
    <button
      type="button"
      onClick={onRemove}
      disabled={disabled}
      aria-label={`Remove ${file.name}`}
      className="absolute top-1 right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-gray-900/60 text-white transition hover:bg-gray-900/80"
    >
      <X className="h-3.5 w-3.5" aria-hidden />
    </button>
  </li>
);
