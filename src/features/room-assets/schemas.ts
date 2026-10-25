import { z } from "zod";
import {
  MEDIA_ALLOWED_IMAGE_MIME_TYPES,
  MEDIA_MAX_FILE_NAME_LENGTH,
  MEDIA_MAX_FILE_SIZE_BYTES,
  MEDIA_MAX_FILES_PER_REQUEST,
} from "@/config/media";
import { money } from "@/utils/schemas";
import type { AssetCondition } from "./types";

export const imageFilesSchema = z
  .array(z.instanceof(File))
  .max(
    MEDIA_MAX_FILES_PER_REQUEST,
    `At most ${MEDIA_MAX_FILES_PER_REQUEST} images can be uploaded`,
  )
  .superRefine((files, ctx) => {
    const allowedTypes: readonly string[] = MEDIA_ALLOWED_IMAGE_MIME_TYPES;
    const invalid = files.find(
      (file) =>
        file.size === 0 ||
        file.size > MEDIA_MAX_FILE_SIZE_BYTES ||
        !allowedTypes.includes(file.type) ||
        file.name.length > MEDIA_MAX_FILE_NAME_LENGTH,
    );
    if (!invalid) return;

    let reason: string;
    if (invalid.size === 0) reason = "is empty";
    else if (invalid.size > MEDIA_MAX_FILE_SIZE_BYTES)
      reason = `exceeds ${MEDIA_MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`;
    else if (!allowedTypes.includes(invalid.type))
      reason = "is not a JPEG, PNG or WebP image";
    else
      reason = `has a name longer than ${MEDIA_MAX_FILE_NAME_LENGTH} characters`;

    ctx.addIssue({ code: "custom", message: `"${invalid.name}" ${reason}` });
  });

const roomAssetBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name exceeds 100 characters"),
  quantity: z
    .string()
    .refine((value) => /^\d+$/.test(value) && Number(value) >= 1, {
      message: "Quantity must be a whole number of at least 1",
    }),
  purchaseDate: z.string(),
  purchaseUnitPrice: money("Purchase unit price", {
    required: false,
    allowZero: false,
  }),
  note: z.string(),
});

export const createRoomAssetSchema = roomAssetBaseSchema.extend({
  files: imageFilesSchema,
});

export type CreateRoomAssetFormValues = z.infer<typeof createRoomAssetSchema>;

export const updateRoomAssetSchema = roomAssetBaseSchema;

export type UpdateRoomAssetFormValues = z.infer<typeof updateRoomAssetSchema>;

const assetConditionSchema = z.enum(["good", "damaged", "broken"], {
  message: "Condition is required",
});

export const recordConditionSchema = z.object({
  newCondition: z
    .union([assetConditionSchema, z.literal("")])
    .refine((value) => value !== "", { message: "Condition is required" }),
  note: z.string(),
  files: imageFilesSchema,
});

export type RecordConditionFormInput = z.input<typeof recordConditionSchema>;
export type RecordConditionFormValues = z.output<typeof recordConditionSchema>;

export const buildSplitRoomAssetSchema = (
  maxQuantity: number,
  currentCondition: AssetCondition,
) =>
  z.object({
    quantity: z
      .string()
      .refine(
        (value) =>
          /^\d+$/.test(value) &&
          Number(value) >= 1 &&
          Number(value) <= maxQuantity - 1,
        {
          message: `Quantity must be a whole number between 1 and ${maxQuantity - 1}`,
        },
      ),
    newCondition: assetConditionSchema.refine(
      (value) => value !== currentCondition,
      { message: "New condition must differ from the current condition" },
    ),
    note: z.string(),
  });

export type SplitRoomAssetFormValues = z.infer<
  ReturnType<typeof buildSplitRoomAssetSchema>
>;
