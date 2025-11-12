import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const CreateBattalionSchema = z.object({
  name: z.string().min(1).max(200),
  country: z.string().min(1).max(100),
  militaryUnit: z.string().min(1).max(200).optional(),
  period: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

export const UpdateBattalionSchema = CreateBattalionSchema.partial();

export const CreateBattalionRouteSchema = z.object({
  battalionId: z.number().int().positive(),
  parcoursId: z.number().int().positive(),
  routeDate: z.string(), // Date format
  historicalContext: z.string().optional(),
});

export const UpdateBattalionRouteSchema = CreateBattalionRouteSchema.omit({
  battalionId: true,
  parcoursId: true,
}).partial();

export class CreateBattalionDto extends createZodDto(CreateBattalionSchema) {}

export class UpdateBattalionDto extends createZodDto(UpdateBattalionSchema) {}

export class CreateBattalionRouteDto extends createZodDto(
  CreateBattalionRouteSchema
) {}

export class UpdateBattalionRouteDto extends createZodDto(
  UpdateBattalionRouteSchema
) {}
