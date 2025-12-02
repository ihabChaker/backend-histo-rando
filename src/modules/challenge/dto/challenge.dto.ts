import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateChallengeSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  challengeType: z.enum([
    'weighted_backpack',
    'period_clothing',
    'distance',
    'time',
  ]),
  pointsReward: z.number().int().positive(),
  difficultyMultiplier: z.number().positive().default(1.0),
  isActive: z.boolean().default(true),
});

export const UpdateChallengeSchema = CreateChallengeSchema.partial();

export const StartChallengeSchema = z.object({
  challengeId: z.number().int().positive(),
  activityId: z.number().int().positive().optional(),
});

export const CompleteChallengeSchema = z.object({
  status: z.enum(['completed', 'failed']),
  pointsEarned: z.number().int().nonnegative(),
});

export class CreateChallengeDto extends createZodDto(CreateChallengeSchema) {
  @ApiProperty({
    example: 'Marche avec sac lesté',
    description: 'Nom du challenge',
  })
  name: string;

  @ApiProperty({
    example: 'Parcourir 5km avec un sac de 10kg',
    description: 'Description du challenge',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'weighted_backpack',
    enum: ['weighted_backpack', 'period_clothing', 'distance', 'time'],
    description: 'Type de challenge',
  })
  challengeType: 'weighted_backpack' | 'period_clothing' | 'distance' | 'time';

  @ApiProperty({ example: 100, description: 'Points de récompense' })
  pointsReward: number;

  @ApiProperty({
    example: 1.5,
    description: 'Multiplicateur de difficulté',
    default: 1.0,
  })
  difficultyMultiplier: number;

  @ApiProperty({ example: true, description: 'Challenge actif', default: true })
  isActive: boolean;
}

export class UpdateChallengeDto extends createZodDto(UpdateChallengeSchema) {
  @ApiProperty({ example: 'Challenge mis à jour', required: false })
  name?: string;

  @ApiProperty({ example: 'Nouvelle description', required: false })
  description?: string;

  @ApiProperty({
    example: 'distance',
    enum: ['weighted_backpack', 'period_clothing', 'distance', 'time'],
    required: false,
  })
  challengeType?: 'weighted_backpack' | 'period_clothing' | 'distance' | 'time';

  @ApiProperty({ example: 150, required: false })
  pointsReward?: number;

  @ApiProperty({ example: 2.0, required: false })
  difficultyMultiplier?: number;

  @ApiProperty({ example: false, required: false })
  isActive?: boolean;
}

export class StartChallengeDto extends createZodDto(StartChallengeSchema) {
  @ApiProperty({ example: 1, description: 'ID du challenge' })
  challengeId: number;

  @ApiProperty({ example: 1, description: "ID de l'activité", required: false })
  activityId?: number;
}

export class CompleteChallengeDto extends createZodDto(
  CompleteChallengeSchema,
) {
  @ApiProperty({
    example: 'completed',
    enum: ['completed', 'failed'],
    description: 'Statut du challenge',
  })
  status: 'completed' | 'failed';

  @ApiProperty({ example: 100, description: 'Points gagnés' })
  pointsEarned: number;
}
