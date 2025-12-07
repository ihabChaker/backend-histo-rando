import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScanQrDto {
  @ApiProperty({
    description: 'QR code value scanned at the POI',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  qrCode: string;

  @ApiProperty({
    description: 'Optional session ID if scanning during an active parcours',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sessionId?: number;
}

export class ScanQrResponseDto {
  @ApiProperty({ description: 'POI details' })
  poi: any;

  @ApiProperty({
    description: 'Quiz triggered by this POI, if any',
    required: false,
  })
  quiz?: any;

  @ApiProperty({
    description: 'Podcast triggered by this POI, if any',
    required: false,
  })
  podcast?: any;

  @ApiProperty({ description: 'Points earned from visit' })
  pointsEarned: number;

  @ApiProperty({ description: 'Whether this is a new visit' })
  isNewVisit: boolean;
}
