import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'User role',
    enum: ['user', 'admin'],
    example: 'admin',
  })
  @IsEnum(['user', 'admin'])
  @IsNotEmpty()
  role: 'user' | 'admin';
}
