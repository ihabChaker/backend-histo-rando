import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const CreateRewardSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  pointsCost: z.number().int().positive(),
  rewardType: z.enum(["discount", "gift", "badge", "premium_content"]),
  partnerName: z.string().max(200).optional(),
  stockQuantity: z.number().int().nonnegative(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().default(true),
});

export const UpdateRewardSchema = CreateRewardSchema.partial();

export const RedeemRewardSchema = z.object({
  rewardId: z.number().int().positive(),
});

export class CreateRewardDto extends createZodDto(CreateRewardSchema) {}

export class UpdateRewardDto extends createZodDto(UpdateRewardSchema) {}

export class RedeemRewardDto extends createZodDto(RedeemRewardSchema) {}
