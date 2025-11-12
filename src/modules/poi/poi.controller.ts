import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
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
import { PoiService } from './poi.service';
import { CreatePOIDto, UpdatePOIDto } from './dto/poi.dto';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('poi')
@ApiBearerAuth()
@Controller('poi')
export class PoiController {
  constructor(private readonly poiService: PoiService) {}

  @Post()
  @ApiOperation({
    summary: "Créer un nouveau point d'intérêt",
    description: 'Ajouter un POI (bunker, mémorial, etc.) à un parcours',
  })
  @ApiResponse({ status: 201, description: 'POI créé avec succès' })
  async create(@Body() createDto: CreatePOIDto) {
    return this.poiService.create(createDto);
  }

  @Public()
  @Get('parcours/:parcoursId')
  @ApiOperation({
    summary: "Lister les POI d'un parcours",
    description:
      "Obtenir tous les points d'intérêt d'un parcours spécifique, triés par ordre",
  })
  @ApiResponse({ status: 200, description: 'Liste des POI' })
  async findByParcours(@Param('parcoursId', ParseIntPipe) parcoursId: number) {
    return this.poiService.findAllByParcours(parcoursId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un POI par ID',
    description: "Retourne les détails d'un point d'intérêt",
  })
  @ApiResponse({ status: 200, description: 'POI trouvé' })
  @ApiResponse({ status: 404, description: 'POI non trouvé' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.poiService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour un POI (PUT)',
    description: "Modifier les informations d'un point d'intérêt",
  })
  @ApiResponse({ status: 200, description: 'POI mis à jour' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePOIDto,
  ) {
    return this.poiService.update(id, updateDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour un POI (PATCH)',
    description: "Modifier partiellement les informations d'un point d'intérêt",
  })
  @ApiResponse({ status: 200, description: 'POI mis à jour' })
  async patchUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePOIDto,
  ) {
    return this.poiService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un POI',
    description: "Supprimer définitivement un point d'intérêt",
  })
  @ApiResponse({ status: 200, description: 'POI supprimé' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.poiService.remove(id);
    return { message: 'POI supprimé avec succès' };
  }
}
