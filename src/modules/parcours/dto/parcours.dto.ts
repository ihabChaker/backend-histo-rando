import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateParcoursSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']),
  distanceKm: z.number().positive(),
  estimatedDuration: z.number().int().positive(),
  isPmrAccessible: z.boolean().optional(),
  historicalTheme: z.string().max(255).optional(),
  startingPointLat: z.number().min(-90).max(90),
  startingPointLon: z.number().min(-180).max(180),
  gpxFileUrl: z.string().url().max(255).optional(),
  imageUrl: z.string().url().max(255).optional(),
  isActive: z.boolean().optional(),
});

export class CreateParcoursDto extends createZodDto(CreateParcoursSchema) {
  @ApiProperty({
    example: 'Plages du Débarquement',
    description: 'Nom du parcours',
  })
  name: string;

  @ApiProperty({
    example:
      'Un parcours historique le long des plages du débarquement de Normandie',
    description: 'Description du parcours',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'medium',
    enum: ['easy', 'medium', 'hard'],
    description: 'Niveau de difficulté',
  })
  difficultyLevel: 'easy' | 'medium' | 'hard';

  @ApiProperty({ example: 8.5, description: 'Distance en kilomètres' })
  distanceKm: number;

  @ApiProperty({ example: 180, description: 'Durée estimée en minutes' })
  estimatedDuration: number;

  @ApiProperty({
    example: true,
    description: 'Accessible aux personnes à mobilité réduite',
    required: false,
    default: false,
  })
  isPmrAccessible?: boolean;

  @ApiProperty({
    example: 'Débarquement de Normandie',
    description: 'Thème historique',
    required: false,
  })
  historicalTheme?: string;

  @ApiProperty({
    example: 49.3714,
    description: 'Latitude du point de départ',
    minimum: -90,
    maximum: 90,
  })
  startingPointLat: number;

  @ApiProperty({
    example: -0.8494,
    description: 'Longitude du point de départ',
    minimum: -180,
    maximum: 180,
  })
  startingPointLon: number;

  @ApiProperty({
    example: 'https://example.com/tracks/parcours1.gpx',
    description: 'URL du fichier GPX',
    required: false,
  })
  gpxFileUrl?: string;

  @ApiProperty({
    example: 'https://example.com/images/parcours1.jpg',
    description: "URL de l'image",
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    example: true,
    description: 'Parcours actif',
    required: false,
    default: true,
  })
  isActive?: boolean;
}

export const UpdateParcoursSchema = CreateParcoursSchema.partial();

export class UpdateParcoursDto extends createZodDto(UpdateParcoursSchema) {
  @ApiProperty({
    example: 'Plages du Débarquement - Mise à jour',
    description: 'Nom du parcours',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 'Description mise à jour',
    description: 'Description du parcours',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'hard',
    enum: ['easy', 'medium', 'hard'],
    description: 'Niveau de difficulté',
    required: false,
  })
  difficultyLevel?: 'easy' | 'medium' | 'hard';

  @ApiProperty({
    example: 10.0,
    description: 'Distance en kilomètres',
    required: false,
  })
  distanceKm?: number;

  @ApiProperty({
    example: 240,
    description: 'Durée estimée en minutes',
    required: false,
  })
  estimatedDuration?: number;

  @ApiProperty({
    example: false,
    description: 'Accessible aux PMR',
    required: false,
  })
  isPmrAccessible?: boolean;

  @ApiProperty({
    example: 'Seconde Guerre Mondiale',
    description: 'Thème historique',
    required: false,
  })
  historicalTheme?: string;

  @ApiProperty({
    example: 49.3714,
    description: 'Latitude du point de départ',
    required: false,
  })
  startingPointLat?: number;

  @ApiProperty({
    example: -0.8494,
    description: 'Longitude du point de départ',
    required: false,
  })
  startingPointLon?: number;

  @ApiProperty({
    example: 'https://example.com/tracks/updated.gpx',
    description: 'URL du fichier GPX',
    required: false,
  })
  gpxFileUrl?: string;

  @ApiProperty({
    example: 'https://example.com/images/updated.jpg',
    description: "URL de l'image",
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    example: false,
    description: 'Parcours actif',
    required: false,
  })
  isActive?: boolean;
}

export const ParcoursQuerySchema = z.object({
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  isPmrAccessible: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === 'string') return val === 'true';
      return val;
    }),
  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === 'string') return val === 'true';
      return val;
    }),
  minDistance: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === 'string') return parseFloat(val);
      return val;
    }),
  maxDistance: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === 'string') return parseFloat(val);
      return val;
    }),
});

export class ParcoursQueryDto extends createZodDto(ParcoursQuerySchema) {
  @ApiProperty({
    example: 'medium',
    enum: ['easy', 'medium', 'hard'],
    description: 'Filtrer par niveau de difficulté',
    required: false,
  })
  difficultyLevel?: 'easy' | 'medium' | 'hard';

  @ApiProperty({
    example: true,
    description: 'Filtrer les parcours accessibles PMR',
    required: false,
  })
  isPmrAccessible?: boolean;

  @ApiProperty({
    example: true,
    description: 'Filtrer les parcours actifs',
    required: false,
  })
  isActive?: boolean;

  @ApiProperty({
    example: 5.0,
    description: 'Distance minimale en km',
    required: false,
  })
  minDistance?: number;

  @ApiProperty({
    example: 15.0,
    description: 'Distance maximale en km',
    required: false,
  })
  maxDistance?: number;
}
