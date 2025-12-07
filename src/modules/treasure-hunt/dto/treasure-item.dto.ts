import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTreasureItemDto {
  @ApiProperty({ description: 'Treasure hunt ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  treasureHuntId: number;

  @ApiProperty({ description: 'Item name', example: 'Médaille des braves' })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({
    description: 'Item description',
    example: 'Médaille commémorative de la bataille',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Image URL', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Points awarded for finding', example: 25 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pointsValue?: number;
}

export class UpdateTreasureItemDto {
  @ApiProperty({ description: 'Item name', required: false })
  @IsString()
  @IsOptional()
  itemName?: string;

  @ApiProperty({ description: 'Item description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Image URL', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Points awarded', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pointsValue?: number;
}

export class ScanTreasureItemDto {
  @ApiProperty({ description: 'QR code UUID of treasure item' })
  @IsString()
  @IsNotEmpty()
  qrCode: string;
}

export class ScanTreasureItemResponseDto {
  @ApiProperty({ description: 'Treasure item found' })
  item: any;

  @ApiProperty({ description: 'Associated treasure hunt' })
  treasureHunt: any;

  @ApiProperty({ description: 'Points earned from this item' })
  pointsEarned: number;

  @ApiProperty({ description: 'Whether this is first time finding this item' })
  isNewFind: boolean;

  @ApiProperty({ description: 'Total items found in this hunt' })
  totalItemsFound: number;

  @ApiProperty({ description: 'Total items in this hunt' })
  totalItemsInHunt: number;

  @ApiProperty({ description: 'Whether the entire hunt is now complete' })
  huntComplete: boolean;

  @ApiProperty({
    description: 'Bonus points if hunt just completed',
    required: false,
  })
  completionBonus?: number;
}
