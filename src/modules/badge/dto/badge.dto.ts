import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsEnum, IsBoolean, Min } from 'class-validator';

export enum BadgeRarity {
  COMMON = 'commun',
  RARE = 'rare',
  EPIC = 'épique',
  LEGENDARY = 'légendaire',
}

export class CreateBadgeDto {
  @ApiProperty({ example: 'Marathonien', description: 'Nom du badge' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Parcourir 42km au total', description: 'Description du badge' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'https://example.com/badge.png', required: false })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiProperty({ example: 'DISTANCE_42KM', description: 'Code de condition' })
  @IsString()
  requirement: string;

  @ApiProperty({ example: 100, description: 'Points rapportés' })
  @IsInt()
  @Min(0)
  points: number;

  @ApiProperty({ enum: BadgeRarity, example: BadgeRarity.COMMON })
  @IsEnum(BadgeRarity)
  rarity: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBadgeDto extends PartialType(CreateBadgeDto) {}
