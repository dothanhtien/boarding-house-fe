import { z } from "zod";

const optionalWholeNumber = (label: string, min: number) =>
  z
    .string()
    .refine((value) => value === "" || /^\d+$/.test(value), {
      message: `${label} must be a whole number`,
    })
    .refine((value) => value === "" || Number(value) >= min, {
      message:
        min === 0
          ? `${label} must not be negative`
          : `${label} must be at least ${min}`,
    });

const optionalPositiveNumber = (label: string) =>
  z.string().refine((value) => {
    if (value === "") return true;
    return !Number.isNaN(Number(value)) && Number(value) > 0;
  }, `${label} must be greater than 0`);

const optionalNonNegativeNumber = (label: string) =>
  z.string().refine((value) => {
    if (value === "") return true;
    return !Number.isNaN(Number(value)) && Number(value) >= 0;
  }, `${label} must not be negative`);

const roomBaseSchema = z.object({
  roomNumber: z
    .string()
    .trim()
    .min(1, "Room number is required")
    .max(20, "Room number exceeds 20 characters"),
  roomCategory: z.enum(["standard", "studio", "duplex", "apartment"]),
  floorNumber: optionalWholeNumber("Floor number", 0),
  area: optionalPositiveNumber("Area"),
  capacity: optionalWholeNumber("Capacity", 1),
  monthlyRent: optionalPositiveNumber("Monthly rent"),
  depositAmount: optionalNonNegativeNumber("Deposit amount"),
  note: z.string(),
});

export const createRoomSchema = roomBaseSchema;

export type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

export const updateRoomSchema = roomBaseSchema.extend({
  roomStatus: z.enum(["available", "reserved", "occupied", "maintenance"]),
});

export type UpdateRoomFormValues = z.infer<typeof updateRoomSchema>;
