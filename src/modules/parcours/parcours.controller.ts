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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ParcoursService } from './parcours.service';
import {
  CreateParcoursDto,
  UpdateParcoursDto,
  ParcoursQueryDto,
} from './dto/parcours.dto';
import { Public } from '@/common/decorators/public.decorator';
import { FileUploadService } from '../file-upload/file-upload.service';
import { GpxParserService } from '../file-upload/gpx-parser.service';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('parcours')
@ApiBearerAuth()
@Controller('parcours')
export class ParcoursController {
  constructor(
    private readonly parcoursService: ParcoursService,
    private readonly fileUploadService: FileUploadService,
    private readonly gpxParserService: GpxParserService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un nouveau parcours',
    description:
      'Créer un parcours de randonnée avec points GPS, difficulté et thème historique',
  })
  @ApiResponse({ status: 201, description: 'Parcours créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() createDto: CreateParcoursDto) {
    return this.parcoursService.create(createDto);
  }

  @Post('upload-gpx')
  @UseInterceptors(
    FileInterceptor('file', new FileUploadService().getGPXMulterConfig()),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload GPX file and extract data',
    description:
      'Upload a GPX file to extract waypoints, start/end points, and calculate distance',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'GPX file uploaded and parsed successfully',
    schema: {
      example: {
        filename: 'abc123.gpx',
        gpxFileUrl: 'http://localhost:3000/uploads/gpx/abc123.gpx',
        startPoint: { lat: 49.3394, lon: -0.8566 },
        endPoint: { lat: 49.3714, lon: -0.8494 },
        totalDistance: 12.5,
        elevationGain: 250,
        waypointsCount: 342,
        geoJson: '{"type":"LineString","coordinates":[[...]]}',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file or GPX format' })
  async uploadGPX(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Parse GPX file
      const gpxData = await this.gpxParserService.parseGPXFile(file.path);

      // Generate public URL
      const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
      const gpxFileUrl = this.fileUploadService.getFileUrl(
        file.filename,
        baseUrl,
      );

      // Convert waypoints to GeoJSON for frontend
      const geoJson = this.gpxParserService.toGeoJSON(gpxData.waypoints);

      return {
        filename: file.filename,
        gpxFileUrl,
        startPoint: gpxData.startPoint,
        endPoint: gpxData.endPoint,
        totalDistance: gpxData.totalDistance,
        elevationGain: gpxData.elevationGain,
        waypointsCount: gpxData.waypoints.length,
        geoJson,
      };
    } catch (error) {
      // Delete file if parsing failed
      this.gpxParserService.deleteFile(file.path);
      throw error;
    }
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lister tous les parcours',
    description:
      'Obtenir la liste des parcours avec filtres optionnels (difficulté, PMR, distance) et pagination',
  })
  @ApiQuery({
    name: 'difficultyLevel',
    required: false,
    enum: ['easy', 'medium', 'hard'],
  })
  @ApiQuery({ name: 'isPmrAccessible', required: false, type: Boolean })
  @ApiQuery({ name: 'minDistance', required: false, type: Number })
  @ApiQuery({ name: 'maxDistance', required: false, type: Number })
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
    description: 'Liste paginée des parcours',
    schema: {
      example: {
        data: [
          {
            id: 1,
            name: 'Chemin du Débarquement',
            description:
              'Parcours historique le long des plages du débarquement',
            difficultyLevel: 'medium',
            distanceKm: 12.5,
            estimatedDuration: 180,
            isPmrAccessible: true,
            historicalTheme: 'D-Day 1944',
            startingPointLat: 49.3394,
            startingPointLon: -0.8566,
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 45,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  async findAll(
    @Query() query: ParcoursQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.parcoursService.findAll(query, pagination);
  }

  @Public()
  @Get('nearby')
  @ApiOperation({
    summary: 'Trouver les parcours à proximité',
    description:
      "Rechercher les parcours dans un rayon donné autour d'une position GPS",
  })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lon', required: true, type: Number })
  @ApiQuery({
    name: 'radius',
    required: false,
    type: Number,
    description: 'Rayon en km (défaut: 50)',
  })
  @ApiResponse({ status: 200, description: 'Parcours à proximité' })
  async findNearby(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('radius') radius?: number,
  ) {
    return this.parcoursService.findNearby(
      Number(lat),
      Number(lon),
      radius ? Number(radius) : 50,
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un parcours par ID',
    description: "Retourne les détails complets d'un parcours avec ses POI",
  })
  @ApiResponse({ status: 200, description: 'Parcours trouvé' })
  @ApiResponse({ status: 404, description: 'Parcours non trouvé' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.parcoursService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour un parcours',
    description: "Modifier les informations d'un parcours existant",
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
