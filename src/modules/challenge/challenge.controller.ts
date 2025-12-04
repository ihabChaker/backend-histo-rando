import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ChallengeService } from './challenge.service';
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  StartChallengeDto,
  CompleteChallengeDto,
} from './dto/challenge.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('challenges')
@ApiBearerAuth()
@Controller('challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau défi' })
  @ApiResponse({ status: 201, description: 'Défi créé' })
  async create(@Body() createDto: CreateChallengeDto) {
    return this.challengeService.createChallenge(createDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lister tous les défis actifs' })
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
    description: 'Liste des défis',
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
  async findAll(@Query() pagination: PaginationDto) {
    return this.challengeService.findAllChallenges(pagination);
  }

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Lister tous les défis actifs (Alias)' })
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
    description: 'Liste des défis',
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
  async findAllActive(@Query() pagination: PaginationDto) {
    return this.challengeService.findAllChallenges(pagination);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un défi par ID' })
  @ApiParam({ name: 'id', description: 'ID du défi' })
  @ApiResponse({ status: 200, description: 'Défi trouvé' })
  @ApiResponse({ status: 404, description: 'Défi non trouvé' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.challengeService.findOneChallenge(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un défi' })
  @ApiParam({ name: 'id', description: 'ID du défi' })
  @ApiResponse({ status: 200, description: 'Défi mis à jour' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateChallengeDto,
  ) {
    return this.challengeService.updateChallenge(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un défi' })
  @ApiParam({ name: 'id', description: 'ID du défi' })
  @ApiResponse({ status: 200, description: 'Défi supprimé' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.challengeService.removeChallenge(id);
    return { message: 'Défi supprimé avec succès' };
  }

  @Post('start')
  @ApiOperation({
    summary: 'Démarrer un défi',
    description: "Commencer un défi lors d'une activité",
  })
  @ApiResponse({ status: 201, description: 'Défi démarré' })
  async startChallenge(
    @CurrentUser() user: any,
    @Body() dto: StartChallengeDto,
  ) {
    return this.challengeService.startChallenge(user.sub, dto);
  }

  @Put('progress/:id')
  @ApiOperation({
    summary: 'Compléter un défi',
    description: 'Marquer un défi comme complété ou échoué',
  })
  @ApiParam({ name: 'id', description: 'ID de la progression du défi' })
  @ApiResponse({ status: 200, description: 'Défi complété' })
  async completeChallenge(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: CompleteChallengeDto,
  ) {
    return this.challengeService.completeChallenge(id, user.sub, dto);
  }

  @Get('progress/me')
  @ApiOperation({ summary: 'Obtenir ma progression des défis' })
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
    description: 'Liste des progressions',
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
  async getUserProgress(
    @CurrentUser() user: any,
    @Query() pagination: PaginationDto,
  ) {
    return this.challengeService.getUserChallengeProgress(user.sub, pagination);
  }

  @Get('my-challenges')
  @ApiOperation({ summary: 'Obtenir ma progression des défis (Alias)' })
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
    description: 'Liste des progressions',
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
  async getMyChallenges(
    @CurrentUser() user: any,
    @Query() pagination: PaginationDto,
  ) {
    return this.challengeService.getUserChallengeProgress(user.sub, pagination);
  }
}
