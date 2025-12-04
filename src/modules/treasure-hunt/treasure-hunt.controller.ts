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
import { TreasureHuntService } from './treasure-hunt.service';
import {
  CreateTreasureHuntDto,
  UpdateTreasureHuntDto,
  RecordTreasureFoundDto,
} from './dto/treasure-hunt.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('treasure-hunt')
@ApiBearerAuth()
@Controller('treasure-hunts')
export class TreasureHuntController {
  constructor(private readonly treasureHuntService: TreasureHuntService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle chasse au trésor' })
  @ApiResponse({ status: 201, description: 'Chasse au trésor créée' })
  async create(@Body() createDto: CreateTreasureHuntDto) {
    return this.treasureHuntService.createTreasureHunt(createDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lister toutes les chasses au trésor actives' })
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
    description: 'Liste des chasses au trésor',
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
    return this.treasureHuntService.findAllTreasureHunts(pagination);
  }

  @Public()
  @Get('parcours/:parcoursId')
  @ApiOperation({ summary: "Obtenir les chasses au trésor d'un parcours" })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
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
    description: 'Liste des chasses au trésor',
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
  async findByParcours(
    @Param('parcoursId', ParseIntPipe) parcoursId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.treasureHuntService.findTreasureHuntsByParcours(
      parcoursId,
      pagination,
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une chasse au trésor par ID' })
  @ApiParam({ name: 'id', description: 'ID de la chasse au trésor' })
  @ApiResponse({ status: 200, description: 'Chasse au trésor trouvée' })
  @ApiResponse({ status: 404, description: 'Chasse au trésor non trouvée' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.treasureHuntService.findOneTreasureHunt(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une chasse au trésor' })
  @ApiParam({ name: 'id', description: 'ID de la chasse au trésor' })
  @ApiResponse({ status: 200, description: 'Chasse au trésor mise à jour' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTreasureHuntDto,
  ) {
    return this.treasureHuntService.updateTreasureHunt(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une chasse au trésor' })
  @ApiParam({ name: 'id', description: 'ID de la chasse au trésor' })
  @ApiResponse({ status: 200, description: 'Chasse au trésor supprimée' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.treasureHuntService.removeTreasureHunt(id);
    return { message: 'Chasse au trésor supprimée avec succès' };
  }

  @Post('found')
  @ApiOperation({
    summary: 'Enregistrer une découverte de trésor',
    description:
      "Marquer un trésor comme trouvé si l'utilisateur est dans le rayon de scan",
  })
  @ApiResponse({
    status: 201,
    description: 'Trésor trouvé',
    schema: {
      example: {
        found: {
          id: 1,
          userId: 1,
          treasureId: 1,
          foundDatetime: '2025-11-12T16:00:00Z',
          pointsEarned: 75,
        },
        message: 'Félicitations ! Vous avez trouvé le trésor !',
        pointsEarned: 75,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Trésor déjà trouvé ou trop loin' })
  async recordFound(
    @CurrentUser() user: any,
    @Body() dto: RecordTreasureFoundDto,
  ) {
    return this.treasureHuntService.recordTreasureFound(user.sub, dto);
  }

  @Get('found/me')
  @ApiOperation({ summary: 'Obtenir mes trésors trouvés' })
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
    description: 'Liste des trésors trouvés',
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
  async getUserTreasures(
    @CurrentUser() user: any,
    @Query() pagination: PaginationDto,
  ) {
    return this.treasureHuntService.getUserTreasuresFound(user.sub, pagination);
  }
}
