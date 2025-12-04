import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BadgeService } from './badge.service';
import { CreateBadgeDto, UpdateBadgeDto } from './dto/badge.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/types/auth.types';

@ApiTags('badges')
@Controller('badges')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Post()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Créer un nouveau badge (Admin)' })
  create(@Body() createBadgeDto: CreateBadgeDto) {
    return this.badgeService.create(createBadgeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les badges' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des badges',
    schema: {
      example: {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 100,
          totalPages: 10,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  findAll(@Query() pagination: PaginationDto) {
    return this.badgeService.findAll(pagination);
  }

  @Get('my-badges')
  @ApiOperation({ summary: 'Obtenir mes badges' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste de mes badges',
    schema: {
      example: {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 50,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  findMyBadges(
    @CurrentUser() user: JwtPayload,
    @Query() pagination: PaginationDto,
  ) {
    return this.badgeService.findMyBadges(user.sub, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un badge par ID' })
  findOne(@Param('id') id: string) {
    return this.badgeService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Mettre à jour un badge (Admin)' })
  update(@Param('id') id: string, @Body() updateBadgeDto: UpdateBadgeDto) {
    return this.badgeService.update(+id, updateBadgeDto);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Supprimer un badge (Admin)' })
  remove(@Param('id') id: string) {
    return this.badgeService.remove(+id);
  }
}
