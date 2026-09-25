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

export const MAX_ROOM_AMENITIES = 20;

const roomAmenitySchema = z.object({
  amenityId: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name exceeds 100 characters"),
  quantity: z
    .string()
    .refine(
      (value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 1),
      { message: "Quantity must be a whole number of at least 1" },
    ),
  icon: z.string(),
});

export type RoomAmenityFormValue = z.infer<typeof roomAmenitySchema>;

const roomAmenitiesSchema = z
  .array(roomAmenitySchema)
  .max(
    MAX_ROOM_AMENITIES,
    `A room must not have more than ${MAX_ROOM_AMENITIES} amenities`,
  )
  .superRefine((amenities, ctx) => {
    const seen = new Set<string>();
    amenities.forEach((amenity, index) => {
      const name = amenity.name.trim();
      if (name === "") return;
      if (seen.has(name)) {
        ctx.addIssue({
          code: "custom",
          message: "Amenity names must be unique within a room",
          path: [index, "name"],
        });
      }
      seen.add(name);
    });
  });

export type RoomAmenitiesFormValues = { amenities: RoomAmenityFormValue[] };

export const createRoomSchema = roomBaseSchema.extend({
  amenities: roomAmenitiesSchema,
});

export type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

export const updateRoomSchema = roomBaseSchema.extend({
  roomStatus: z.enum(["available", "reserved", "occupied", "maintenance"]),
  amenities: roomAmenitiesSchema,
});

export type UpdateRoomFormValues = z.infer<typeof updateRoomSchema>;
