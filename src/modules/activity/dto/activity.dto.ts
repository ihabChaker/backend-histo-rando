import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

// Zod Schemas
export const CreateUserActivitySchema = z.object({
  parcoursId: z.number().int().positive(),
  activityType: z.enum(['walking', 'running', 'cycling']).default('walking'),
});

export const UpdateUserActivitySchema = z.object({
  endDatetime: z.string().datetime().optional(),
  distanceCoveredKm: z.number().positive().optional(),
  pointsEarned: z.number().int().nonnegative().optional(),
  status: z.enum(['in_progress', 'completed', 'abandoned']).optional(),
  averageSpeed: z.number().positive().optional(),
  gpxTraceUrl: z.string().url().optional(),
});

export const RecordPOIVisitSchema = z.object({
  poiId: z.number().int().positive(),
  activityId: z.number().int().positive().optional().nullable(),
  scannedQr: z.boolean().optional(),
  listenedAudio: z.boolean().optional(),
  pointsEarned: z.number().int().nonnegative().optional(),
});

// DTOs
export class CreateUserActivityDto extends createZodDto(
  CreateUserActivitySchema,
) {
  @ApiProperty({ example: 1, description: 'ID du parcours' })
  parcoursId: number;

  @ApiProperty({
    example: 'walking',
    enum: ['walking', 'running', 'cycling'],
    description: "Type d'activité",
    default: 'walking',
  })
  activityType: 'walking' | 'running' | 'cycling';
}

export class UpdateUserActivityDto extends createZodDto(
  UpdateUserActivitySchema,
) {
  @ApiProperty({
    example: '2024-11-12T18:30:00Z',
    description: 'Date et heure de fin',
    required: false,
  })
  endDatetime?: string;

  @ApiProperty({
    example: 8.5,
    description: 'Distance parcourue en km',
    required: false,
  })
  distanceCoveredKm?: number;

  @ApiProperty({
    example: 150,
    description: 'Points gagnés',
    required: false,
  })
  pointsEarned?: number;

  @ApiProperty({
    example: 'completed',
    enum: ['in_progress', 'completed', 'abandoned'],
    description: "Statut de l'activité",
    required: false,
  })
  status?: 'in_progress' | 'completed' | 'abandoned';

  @ApiProperty({
    example: 10.5,
    description: 'Vitesse moyenne en km/h',
    required: false,
  })
  averageSpeed?: number;

  @ApiProperty({
    example: 'https://example.com/traces/activity123.gpx',
    description: 'URL de la trace GPX',
    required: false,
  })
  gpxTraceUrl?: string;
}

export class RecordPOIVisitDto extends createZodDto(RecordPOIVisitSchema) {
  @ApiProperty({ example: 1, description: 'ID du POI visité' })
  poiId: number;

  @ApiProperty({
    example: 1,
    description: "ID de l'activité en cours",
    required: false,
  })
  activityId?: number;

  @ApiProperty({
    example: true,
    description: 'QR code scanné',
    required: false,
  })
  scannedQr?: boolean;

  @ApiProperty({
    example: true,
    description: 'Audio écouté',
    required: false,
  })
  listenedAudio?: boolean;

  @ApiProperty({
    example: 10,
    description: 'Points gagnés pour cette visite',
    required: false,
  })
  pointsEarned?: number;
}
