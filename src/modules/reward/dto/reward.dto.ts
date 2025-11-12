import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateRewardSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  pointsCost: z.number().int().positive(),
  rewardType: z.enum(['discount', 'gift', 'badge', 'premium_content']),
  partnerName: z.string().max(200).optional(),
  stockQuantity: z.number().int().nonnegative(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().default(true),
});

export const UpdateRewardSchema = CreateRewardSchema.partial();

export const RedeemRewardSchema = z.object({
  rewardId: z.number().int().positive(),
});

export class CreateRewardDto extends createZodDto(CreateRewardSchema) {
  @ApiProperty({
    example: 'Réduction Musée de Caen',
    description: 'Nom de la récompense',
  })
  name: string;

  @ApiProperty({
    example: "10% de réduction sur l'entrée au Mémorial de Caen",
    description: 'Description de la récompense',
    required: false,
  })
  description?: string;

  @ApiProperty({ example: 500, description: 'Coût en points' })
  pointsCost: number;

  @ApiProperty({
    example: 'discount',
    enum: ['discount', 'gift', 'badge', 'premium_content'],
    description: 'Type de récompense',
  })
  rewardType: 'discount' | 'gift' | 'badge' | 'premium_content';

  @ApiProperty({
    example: 'Mémorial de Caen',
    description: 'Nom du partenaire',
    required: false,
  })
  partnerName?: string;

  @ApiProperty({ example: 100, description: 'Quantité en stock' })
  stockQuantity: number;

  @ApiProperty({
    example: 'https://example.com/rewards/memorial.jpg',
    description: "URL de l'image",
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    example: true,
    description: 'Récompense disponible',
    default: true,
  })
  isAvailable: boolean;
}

export class UpdateRewardDto extends createZodDto(UpdateRewardSchema) {
  @ApiProperty({ example: 'Récompense mise à jour', required: false })
  name?: string;

  @ApiProperty({ example: 'Nouvelle description', required: false })
  description?: string;

  @ApiProperty({ example: 600, required: false })
  pointsCost?: number;

  @ApiProperty({
    example: 'gift',
    enum: ['discount', 'gift', 'badge', 'premium_content'],
    required: false,
  })
  rewardType?: 'discount' | 'gift' | 'badge' | 'premium_content';

  @ApiProperty({ example: 'Nouveau partenaire', required: false })
  partnerName?: string;

  @ApiProperty({ example: 50, required: false })
  stockQuantity?: number;

  @ApiProperty({ example: 'https://example.com/new.jpg', required: false })
  imageUrl?: string;

  @ApiProperty({ example: false, required: false })
  isAvailable?: boolean;
}

export class RedeemRewardDto extends createZodDto(RedeemRewardSchema) {
  @ApiProperty({ example: 1, description: 'ID de la récompense à échanger' })
  rewardId: number;
}
