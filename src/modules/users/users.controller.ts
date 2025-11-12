import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserProfileDto } from './dto/user.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtPayload } from '@/common/types/auth.types';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: "Obtenir le profil de l'utilisateur connecté",
    description:
      "Retourne les informations complètes du profil de l'utilisateur authentifié",
  })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur',
    schema: {
      example: {
        id: 1,
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isPmr: false,
        totalPoints: 1250,
        totalKm: 45.8,
        avatarUrl: 'https://example.com/avatar.jpg',
        registrationDate: '2025-01-15T10:00:00Z',
      },
    },
  })
  async getCurrentUser(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Get('me/stats')
  @ApiOperation({
    summary: "Obtenir les statistiques de l'utilisateur",
    description:
      "Retourne les stats cumulées (points, km) de l'utilisateur connecté",
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques utilisateur',
    schema: {
      example: {
        totalPoints: 1250,
        totalKm: 45.8,
        username: 'johndoe',
        isPmr: false,
      },
    },
  })
  async getUserStats(@CurrentUser() user: JwtPayload) {
    return this.usersService.getUserStats(user.sub);
  }

  @Put('me')
  @ApiOperation({
    summary: 'Mettre à jour le profil utilisateur (PUT)',
    description:
      "Modifier les informations du profil de l'utilisateur connecté",
  })
  @ApiResponse({
    status: 200,
    description: 'Profil mis à jour avec succès',
  })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, updateDto);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Mettre à jour le profil utilisateur (PATCH)',
    description:
      "Modifier partiellement les informations du profil de l'utilisateur connecté",
  })
  @ApiResponse({
    status: 200,
    description: 'Profil mis à jour avec succès',
  })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async patchProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, updateDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un profil utilisateur par ID',
    description: "Retourne les informations publiques d'un utilisateur",
  })
  @ApiResponse({ status: 200, description: 'Profil utilisateur trouvé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }
}
