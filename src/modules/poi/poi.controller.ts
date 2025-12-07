import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { Express } from 'express';
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
import { PoiService } from './poi.service';
import { CreatePOIDto, UpdatePOIDto } from './dto/poi.dto';
import { ScanQrDto, ScanQrResponseDto } from './dto/scan-qr.dto';
import { Public } from '@/common/decorators/public.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { FileUploadService } from '../file-upload/file-upload.service';

@ApiTags('poi')
@ApiBearerAuth()
@Controller('poi')
export class PoiController {
  constructor(
    private readonly poiService: PoiService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Créer un nouveau point d'intérêt",
    description: 'Ajouter un POI (bunker, mémorial, etc.) à un parcours',
  })
  @ApiResponse({ status: 201, description: 'POI créé avec succès' })
  async create(@Body() createDto: CreatePOIDto) {
    return this.poiService.create(createDto);
  }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new FileUploadService().getImageMulterConfig('poi'),
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload POI image',
    description:
      'Upload an image for a point of interest (jpg, png, webp, max 5MB)',
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
    description: 'Image uploaded successfully',
    schema: {
      example: {
        filename: 'abc123.jpg',
        imageUrl: 'http://localhost:3000/uploads/images/poi/abc123.jpg',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file format' })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const imageUrl = this.fileUploadService.getImageUrl(
      file.filename,
      'poi',
      baseUrl,
    );

    return {
      filename: file.filename,
      imageUrl,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Lister tous les POI',
    description: "Obtenir la liste paginée des points d'intérêt",
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Liste paginée de tous les POI' })
  async findAll(@Query() pagination: PaginationDto) {
    return this.poiService.findAll(pagination);
  }

  @Public()
  @Get('parcours/:parcoursId')
  @ApiOperation({
    summary: "Lister les POI d'un parcours",
    description:
      "Obtenir tous les points d'intérêt d'un parcours spécifique, triés par ordre",
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Liste paginée des POI' })
  async findByParcours(
    @Param('parcoursId', ParseIntPipe) parcoursId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.poiService.findAllByParcours(parcoursId, pagination);
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

  @Post('scan-qr')
  @ApiOperation({
    summary: 'Scanner un QR code de POI',
    description:
      'Enregistrer une visite et récupérer le contenu du POI (quiz/podcast)',
  })
  @ApiResponse({
    status: 200,
    description: 'QR scanné avec succès',
    type: ScanQrResponseDto,
  })
  @ApiResponse({ status: 404, description: 'QR code invalide' })
  async scanQr(@Req() req: any, @Body() scanDto: ScanQrDto) {
    return this.poiService.scanQr(req.user.id, scanDto);
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
