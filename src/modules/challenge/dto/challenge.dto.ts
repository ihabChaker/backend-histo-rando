import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const CreateChallengeSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  challengeType: z.enum([
    "weighted_backpack",
    "period_clothing",
    "distance",
    "time",
  ]),
  pointsReward: z.number().int().positive(),
  difficultyMultiplier: z.number().positive().default(1.0),
  isActive: z.boolean().default(true),
});

export const UpdateChallengeSchema = CreateChallengeSchema.partial();

export const StartChallengeSchema = z.object({
  challengeId: z.number().int().positive(),
  activityId: z.number().int().positive(),
});

export const CompleteChallengeSchema = z.object({
  status: z.enum(["completed", "failed"]),
  pointsEarned: z.number().int().nonnegative(),
});

export class CreateChallengeDto extends createZodDto(CreateChallengeSchema) {}

export class UpdateChallengeDto extends createZodDto(UpdateChallengeSchema) {}

export class StartChallengeDto extends createZodDto(StartChallengeSchema) {}

export class CompleteChallengeDto extends createZodDto(
  CompleteChallengeSchema
) {}
