import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

// Zod Schema for validation
export const CreatePodcastSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  durationSeconds: z.number().int().positive(),
  audioFileUrl: z.string().url(),
  narrator: z.string().max(100).optional(),
  language: z.string().max(10).default('fr'),
  thumbnailUrl: z.string().url().optional(),
});

export const UpdatePodcastSchema = CreatePodcastSchema.partial();

export const AssociatePodcastToParcoursSchema = z.object({
  parcoursId: z.number().int().positive(),
  playOrder: z.number().int().positive(),
  suggestedKm: z.number().positive().optional(),
});

// DTOs
export class CreatePodcastDto extends createZodDto(CreatePodcastSchema) {
  @ApiProperty({
    example: 'Le débarquement du 6 juin 1944',
    description: 'Titre du podcast',
  })
  title: string;

  @ApiProperty({
    example: 'Récit détaillé des événements du jour J',
    description: 'Description du podcast',
    required: false,
  })
  description?: string;

  @ApiProperty({ example: 420, description: 'Durée en secondes' })
  durationSeconds: number;

  @ApiProperty({
    example: 'https://example.com/podcasts/d-day.mp3',
    description: 'URL du fichier audio',
  })
  audioFileUrl: string;

  @ApiProperty({
    example: 'Jean Dupont',
    description: 'Narrateur',
    required: false,
  })
  narrator?: string;

  @ApiProperty({ example: 'fr', description: 'Langue', default: 'fr' })
  language: string;

  @ApiProperty({
    example: 'https://example.com/thumbnails/d-day.jpg',
    description: 'URL de la miniature',
    required: false,
  })
  thumbnailUrl?: string;
}

export class UpdatePodcastDto extends createZodDto(UpdatePodcastSchema) {
  @ApiProperty({ example: 'Titre mis à jour', required: false })
  title?: string;

  @ApiProperty({ example: 'Nouvelle description', required: false })
  description?: string;

  @ApiProperty({ example: 600, required: false })
  durationSeconds?: number;

  @ApiProperty({ example: 'https://example.com/new.mp3', required: false })
  audioFileUrl?: string;

  @ApiProperty({ example: 'Marie Martin', required: false })
  narrator?: string;

  @ApiProperty({ example: 'en', required: false })
  language?: string;

  @ApiProperty({ example: 'https://example.com/new.jpg', required: false })
  thumbnailUrl?: string;
}

export class AssociatePodcastToParcoursDto extends createZodDto(
  AssociatePodcastToParcoursSchema,
) {
  @ApiProperty({ example: 1, description: 'ID du parcours' })
  parcoursId: number;

  @ApiProperty({ example: 1, description: 'Ordre de lecture' })
  playOrder: number;

  @ApiProperty({
    example: 3.5,
    description: 'Kilomètre suggéré pour la lecture',
    required: false,
  })
  suggestedKm?: number;
}
