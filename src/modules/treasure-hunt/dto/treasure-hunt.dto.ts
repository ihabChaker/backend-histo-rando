import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const CreateTreasureHuntSchema = z.object({
  parcoursId: z.number().int().positive(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  targetObject: z.string().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  scanRadiusMeters: z.number().int().positive().default(50),
  pointsReward: z.number().int().positive(),
  qrCode: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
});

export const UpdateTreasureHuntSchema = CreateTreasureHuntSchema.partial().omit(
  { parcoursId: true }
);

export const RecordTreasureFoundSchema = z.object({
  treasureId: z.number().int().positive(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export class CreateTreasureHuntDto extends createZodDto(
  CreateTreasureHuntSchema
) {}

export class UpdateTreasureHuntDto extends createZodDto(
  UpdateTreasureHuntSchema
) {}

export class RecordTreasureFoundDto extends createZodDto(
  RecordTreasureFoundSchema
) {}
