import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateTreasureHuntSchema = z.object({
  parcoursId: z.number().int().positive(),
  name: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  scanRadiusMeters: z.number().int().positive().default(50),
  qrCode: z.string().max(255).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const UpdateTreasureHuntSchema = CreateTreasureHuntSchema.partial().omit(
  { parcoursId: true },
);

export const RecordTreasureFoundSchema = z.object({
  treasureId: z.number().int().positive().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  qrCode: z.string().optional(),
});

export class CreateTreasureHuntDto extends createZodDto(
  CreateTreasureHuntSchema,
) {
  @ApiProperty({ example: 1, description: 'ID du parcours' })
  parcoursId: number;

  @ApiProperty({
    example: 'Bunker caché de la batterie',
    description: 'Nom du trésor',
  })
  name: string;

  @ApiProperty({
    example: "Trouvez le bunker d'observation allemand",
    description: 'Description du trésor',
    required: false,
  })
  description?: string;

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
    example: 50,
    description: 'Rayon de scan en mètres',
    default: 50,
  })
  scanRadiusMeters: number;

  @ApiProperty({
    example: 'QR_TREASURE_001',
    description: 'Code QR du trésor',
    required: false,
  })
  qrCode?: string;

  @ApiProperty({ example: true, description: 'Trésor actif', default: true })
  isActive: boolean;
}

export class UpdateTreasureHuntDto extends createZodDto(
  UpdateTreasureHuntSchema,
) {
  @ApiProperty({ example: 'Trésor mis à jour', required: false })
  name?: string;

  @ApiProperty({ example: 'Nouvelle description', required: false })
  description?: string;

  @ApiProperty({ example: 'Nouvel objet', required: false })
  targetObject?: string;

  @ApiProperty({ example: 49.35, required: false })
  latitude?: number;

  @ApiProperty({ example: -0.69, required: false })
  longitude?: number;

  @ApiProperty({ example: 100, required: false })
  scanRadiusMeters?: number;

  @ApiProperty({ example: 'QR_TREASURE_002', required: false })
  qrCode?: string;

  @ApiProperty({ example: false, required: false })
  isActive?: boolean;
}

export class RecordTreasureFoundDto extends createZodDto(
  RecordTreasureFoundSchema,
) {
  @ApiProperty({
    example: 1,
    description: 'ID du trésor trouvé',
    required: false,
  })
  treasureId?: number;

  @ApiProperty({ example: 49.3485, description: "Latitude de l'utilisateur" })
  latitude: number;

  @ApiProperty({ example: -0.6911, description: "Longitude de l'utilisateur" })
  longitude: number;

  @ApiProperty({
    example: 'QR_CODE_123',
    description: 'Code QR scanné',
    required: false,
  })
  qrCode?: string;
}
