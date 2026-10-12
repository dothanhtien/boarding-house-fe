"use client";

import React from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus } from "lucide-react";
import { useObjectUrls } from "@/hooks/useObjectUrls";
import { ImageFilePreview } from "./ImageFilePreview";

interface ImageFilesInputProps {
  id?: string;
  value: File[];
  onChange: (files: File[]) => void;
  accept: readonly string[];
  maxFiles: number;
  maxSizeBytes: number;
  disabled?: boolean;
  error?: boolean;
  hint?: string;
}

export const ImageFilesInput: React.FC<ImageFilesInputProps> = ({
  id,
  value,
  onChange,
  accept,
  maxFiles,
  maxSizeBytes,
  disabled = false,
  error = false,
  hint,
}) => {
  const isFull = value.length >= maxFiles;
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: Object.fromEntries(accept.map((type) => [type, []])),
    disabled: disabled || isFull,
    onDrop: (acceptedFiles, rejections) =>
      onChange([...value, ...acceptedFiles, ...rejections.map((r) => r.file)]),
  });

  const previews = useObjectUrls(value);

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const maxSizeMb = Math.round(maxSizeBytes / 1024 / 1024);
  const extensions = accept
    .map((type) => type.replace("image/", "").toUpperCase())
    .join(", ");

  return (
    <div>
      <div
        {...getRootProps()}
        className={`rounded-xl border border-dashed p-5 text-center transition ${
          disabled || isFull
            ? "cursor-not-allowed opacity-60"
            : "hover:border-brand-500 dark:hover:border-brand-500 cursor-pointer"
        } ${
          isDragActive
            ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
            : error
              ? "border-error-500 bg-gray-50 dark:bg-gray-900"
              : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
        }`}
      >
        <input id={id} {...getInputProps()} />
        <ImagePlus
          className="mx-auto mb-2 h-6 w-6 text-gray-500 dark:text-gray-400"
          aria-hidden
        />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isFull
            ? `Maximum of ${maxFiles} images reached`
            : isDragActive
              ? "Drop images here"
              : "Drag & drop images here, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {extensions} · up to {maxSizeMb} MB each · max {maxFiles} images
        </p>
      </div>

      {value.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {value.map((file, index) => (
            <ImageFilePreview
              key={`${file.name}-${file.lastModified}-${index}`}
              file={file}
              src={previews[index]}
              onRemove={() => removeAt(index)}
              disabled={disabled}
            />
          ))}
        </ul>
      )}

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error ? "text-error-500" : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};
