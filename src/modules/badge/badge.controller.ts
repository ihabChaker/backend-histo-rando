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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  findAll() {
    return this.badgeService.findAll();
  }

  @Get('my-badges')
  @ApiOperation({ summary: 'Obtenir mes badges' })
  findMyBadges(@CurrentUser() user: JwtPayload) {
    return this.badgeService.findMyBadges(user.sub);
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
