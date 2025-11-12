import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { ParcoursService } from './parcours.service';
import { CreateParcoursDto, UpdateParcoursDto, ParcoursQueryDto } from './dto/parcours.dto';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('parcours')
@ApiBearerAuth()
@Controller('parcours')
export class ParcoursController {
    constructor(private readonly parcoursService: ParcoursService) { }

    @Post()
    @ApiOperation({
        summary: 'Créer un nouveau parcours',
        description: 'Créer un parcours de randonnée avec points GPS, difficulté et thème historique',
    })
    @ApiResponse({ status: 201, description: 'Parcours créé avec succès' })
    @ApiResponse({ status: 400, description: 'Données invalides' })
    async create(@Body() createDto: CreateParcoursDto) {
        return this.parcoursService.create(createDto);
    }

    @Public()
    @Get()
    @ApiOperation({
        summary: 'Lister tous les parcours',
        description: 'Obtenir la liste des parcours avec filtres optionnels (difficulté, PMR, distance)',
    })
    @ApiQuery({ name: 'difficultyLevel', required: false, enum: ['easy', 'medium', 'hard'] })
    @ApiQuery({ name: 'isPmrAccessible', required: false, type: Boolean })
    @ApiQuery({ name: 'minDistance', required: false, type: Number })
    @ApiQuery({ name: 'maxDistance', required: false, type: Number })
    @ApiResponse({
        status: 200,
        description: 'Liste des parcours',
        schema: {
            example: [
                {
                    id: 1,
                    name: 'Chemin du Débarquement',
                    description: 'Parcours historique le long des plages du débarquement',
                    difficultyLevel: 'medium',
                    distanceKm: 12.5,
                    estimatedDuration: 180,
                    isPmrAccessible: true,
                    historicalTheme: 'D-Day 1944',
                    startingPointLat: 49.3394,
                    startingPointLon: -0.8566,
                },
            ],
        },
    })
    async findAll(@Query() query: ParcoursQueryDto) {
        return this.parcoursService.findAll(query);
    }

    @Public()
    @Get('nearby')
    @ApiOperation({
        summary: 'Trouver les parcours à proximité',
        description: 'Rechercher les parcours dans un rayon donné autour d\'une position GPS',
    })
    @ApiQuery({ name: 'lat', required: true, type: Number })
    @ApiQuery({ name: 'lon', required: true, type: Number })
    @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Rayon en km (défaut: 50)' })
    @ApiResponse({ status: 200, description: 'Parcours à proximité' })
    async findNearby(
        @Query('lat') lat: number,
        @Query('lon') lon: number,
        @Query('radius') radius?: number,
    ) {
        return this.parcoursService.findNearby(Number(lat), Number(lon), radius ? Number(radius) : 50);
    }

    @Public()
    @Get(':id')
    @ApiOperation({
        summary: 'Obtenir un parcours par ID',
        description: 'Retourne les détails complets d\'un parcours avec ses POI',
    })
    @ApiResponse({ status: 200, description: 'Parcours trouvé' })
    @ApiResponse({ status: 404, description: 'Parcours non trouvé' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.parcoursService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Mettre à jour un parcours',
        description: 'Modifier les informations d\'un parcours existant',
    })
    @ApiResponse({ status: 200, description: 'Parcours mis à jour' })
    @ApiResponse({ status: 404, description: 'Parcours non trouvé' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateParcoursDto,
    ) {
        return this.parcoursService.update(id, updateDto);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Supprimer un parcours',
        description: 'Supprimer définitivement un parcours',
    })
    @ApiResponse({ status: 200, description: 'Parcours supprimé' })
    @ApiResponse({ status: 404, description: 'Parcours non trouvé' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.parcoursService.remove(id);
        return { message: 'Parcours supprimé avec succès' };
    }
}
