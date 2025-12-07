import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreatePOISchema = z.object({
  parcoursId: z.number().int().positive(),
  name: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  poiType: z.enum([
    'bunker',
    'blockhaus',
    'memorial',
    'museum',
    'beach',
    'monument',
  ]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  historicalPeriod: z.string().max(100).optional().nullable(),
  orderInParcours: z.number().int().positive(),
  qrCode: z.string().max(255).optional().nullable(),
  imageUrl: z.string().url().max(255).optional().nullable().or(z.literal('')),
  audioUrl: z.string().url().max(255).optional().nullable().or(z.literal('')),
  quizId: z.number().int().positive().optional().nullable(),
  podcastId: z.number().int().positive().optional().nullable(),
  treasureHuntId: z.number().int().positive().optional().nullable(),
});

export class CreatePOIDto extends createZodDto(CreatePOISchema) {
  @ApiProperty({ example: 1, description: 'ID du parcours associé' })
  parcoursId: number;

  @ApiProperty({
    example: 'Batterie de Longues-sur-Mer',
    description: "Nom du point d'intérêt",
  })
  name: string;

  @ApiProperty({
    example: 'Batterie côtière allemande construite en 1943',
    description: 'Description détaillée',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'bunker',
    enum: ['bunker', 'blockhaus', 'memorial', 'museum', 'beach', 'monument'],
    description: 'Type de POI',
  })
  poiType:
    | 'bunker'
    | 'blockhaus'
    | 'memorial'
    | 'museum'
    | 'beach'
    | 'monument';

  @ApiProperty({
    example: 49.3485,
    description: 'Latitude',
    minimum: -90,
    maximum: 90,
  })
  latitude: number;

  @ApiProperty({
    example: -0.6911,
    description: 'Longitude',
    minimum: -180,
    maximum: 180,
  })
  longitude: number;

  @ApiProperty({
    example: 'Seconde Guerre Mondiale',
    description: 'Période historique',
    required: false,
  })
  historicalPeriod?: string;

  @ApiProperty({ example: 1, description: 'Ordre dans le parcours' })
  orderInParcours: number;

  @ApiProperty({
    example: 'QR_LONGUES_001',
    description: 'Code QR pour scanner',
    required: false,
  })
  qrCode?: string;

  @ApiProperty({
    example: 'https://example.com/images/longues.jpg',
    description: "URL de l'image",
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    example: 'https://example.com/audio/longues.mp3',
    description: 'URL du podcast audio',
    required: false,
  })
  audioUrl?: string;

  @ApiProperty({
    example: 1,
    description: 'ID du quiz attaché',
    required: false,
  })
  quizId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID du podcast attaché',
    required: false,
  })
  podcastId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la chasse au trésor attachée',
    required: false,
  })
  treasureHuntId?: number;
}

export const UpdatePOISchema = CreatePOISchema.partial().omit({
  parcoursId: true,
});

export class UpdatePOIDto extends createZodDto(UpdatePOISchema) {
  @ApiProperty({
    example: 'Batterie de Longues - Mise à jour',
    description: "Nom du point d'intérêt",
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 'Description mise à jour',
    description: 'Description détaillée',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'memorial',
    enum: ['bunker', 'blockhaus', 'memorial', 'museum', 'beach', 'monument'],
    description: 'Type de POI',
    required: false,
  })
  poiType?:
    | 'bunker'
    | 'blockhaus'
    | 'memorial'
    | 'museum'
    | 'beach'
    | 'monument';

  @ApiProperty({ example: 49.35, description: 'Latitude', required: false })
  latitude?: number;

  @ApiProperty({ example: -0.69, description: 'Longitude', required: false })
  longitude?: number;

  @ApiProperty({
    example: '1939-1945',
    description: 'Période historique',
    required: false,
  })
  historicalPeriod?: string;

  @ApiProperty({
    example: 2,
    description: 'Ordre dans le parcours',
    required: false,
  })
  orderInParcours?: number;

  @ApiProperty({
    example: 'QR_UPDATED_001',
    description: 'Code QR',
    required: false,
  })
  qrCode?: string;

  @ApiProperty({
    example: 'https://example.com/images/updated.jpg',
    description: "URL de l'image",
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    example: 'https://example.com/audio/updated.mp3',
    description: 'URL du podcast',
    required: false,
  })
  audioUrl?: string;

  @ApiProperty({
    example: 1,
    description: 'ID du quiz attaché',
    required: false,
  })
  quizId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID du podcast attaché',
    required: false,
  })
  podcastId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la chasse au trésor attachée',
    required: false,
  })
  treasureHuntId?: number;
}
