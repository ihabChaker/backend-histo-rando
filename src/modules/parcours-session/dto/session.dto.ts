import { IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartSessionDto {
  @ApiProperty({ description: 'Parcours ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  parcoursId: number;

  @ApiProperty({ description: 'Starting latitude', example: 48.8566 })
  @IsNumber()
  @IsNotEmpty()
  startLat: number;

  @ApiProperty({ description: 'Starting longitude', example: 2.3522 })
  @IsNumber()
  @IsNotEmpty()
  startLon: number;
}

export class UpdateSessionDto {
  @ApiProperty({ description: 'Current latitude', example: 48.8566 })
  @IsNumber()
  @IsNotEmpty()
  currentLat: number;

  @ApiProperty({ description: 'Current longitude', example: 2.3522 })
  @IsNumber()
  @IsNotEmpty()
  currentLon: number;

  @ApiProperty({ description: 'Distance covered in meters', example: 1250.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  distanceCovered?: number;
}

export class CompleteSessionDto {
  @ApiProperty({ description: 'Final latitude', example: 48.8566 })
  @IsNumber()
  @IsNotEmpty()
  finalLat: number;

  @ApiProperty({ description: 'Final longitude', example: 2.3522 })
  @IsNumber()
  @IsNotEmpty()
  finalLon: number;

  @ApiProperty({
    description: 'Total distance covered in meters',
    example: 5000.0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  distanceCovered: number;
}
