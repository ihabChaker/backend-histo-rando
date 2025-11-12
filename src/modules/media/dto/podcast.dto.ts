import { z } from "zod";
import { createZodDto } from "nestjs-zod";

// Zod Schema for validation
export const CreatePodcastSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  durationSeconds: z.number().int().positive(),
  audioFileUrl: z.string().url(),
  narrator: z.string().max(100).optional(),
  language: z.string().max(10).default("fr"),
  thumbnailUrl: z.string().url().optional(),
});

export const UpdatePodcastSchema = CreatePodcastSchema.partial();

export const AssociatePodcastToParcoursSchema = z.object({
  parcoursId: z.number().int().positive(),
  playOrder: z.number().int().positive(),
  suggestedKm: z.number().positive().optional(),
});

// DTOs
export class CreatePodcastDto extends createZodDto(CreatePodcastSchema) {}

export class UpdatePodcastDto extends createZodDto(UpdatePodcastSchema) {}

export class AssociatePodcastToParcoursDto extends createZodDto(
  AssociatePodcastToParcoursSchema
) {}
