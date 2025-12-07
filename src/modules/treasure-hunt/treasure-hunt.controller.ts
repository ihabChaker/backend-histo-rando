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
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { TreasureHuntService } from './treasure-hunt.service';
import {
  CreateTreasureHuntDto,
  UpdateTreasureHuntDto,
} from './dto/treasure-hunt.dto';
import {
  CreateTreasureItemDto,
  UpdateTreasureItemDto,
  ScanTreasureItemDto,
  ScanTreasureItemResponseDto,
} from './dto/treasure-item.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { FileUploadService } from '../file-upload/file-upload.service';

@ApiTags('treasure-hunt')
@ApiBearerAuth()
@Controller('treasure-hunts')
export class TreasureHuntController {
  constructor(
    private readonly treasureHuntService: TreasureHuntService,
    private readonly fileUploadService: FileUploadService,
  ) {}

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

  // REMOVED: POST /found endpoint - points are now awarded at item level only via scanTreasureItem

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

  // ===== TREASURE ITEM ENDPOINTS =====

  @Post('items')
  @ApiOperation({ summary: 'Créer un item de trésor' })
  @ApiResponse({ status: 201, description: 'Item créé avec succès' })
  async createItem(@Body() dto: CreateTreasureItemDto) {
    return this.treasureHuntService.createTreasureItem(dto);
  }

  @Get(':huntId/items')
  @ApiOperation({ summary: "Lister les items d'une chasse au trésor" })
  @ApiParam({ name: 'huntId', description: 'ID de la chasse au trésor' })
  async getItemsByHunt(@Param('huntId', ParseIntPipe) huntId: number) {
    return this.treasureHuntService.findItemsByHunt(huntId);
  }

  @Get(':huntId/found-items')
  @ApiOperation({
    summary: "Obtenir les items trouvés par l'utilisateur pour une chasse",
  })
  @ApiParam({ name: 'huntId', description: 'ID de la chasse au trésor' })
  async getFoundItemsByHunt(
    @CurrentUser() user: any,
    @Param('huntId', ParseIntPipe) huntId: number,
  ) {
    return this.treasureHuntService.getUserFoundItemsForHunt(user.sub, huntId);
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Obtenir un item par ID' })
  async getItem(@Param('id', ParseIntPipe) id: number) {
    return this.treasureHuntService.findOneItem(id);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Mettre à jour un item' })
  async updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTreasureItemDto,
  ) {
    return this.treasureHuntService.updateTreasureItem(id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Supprimer un item' })
  async deleteItem(@Param('id', ParseIntPipe) id: number) {
    await this.treasureHuntService.removeTreasureItem(id);
    return { message: 'Item supprimé avec succès' };
  }

  @Post('items/scan')
  @ApiOperation({ summary: "Scanner le QR code d'un item de trésor" })
  @ApiResponse({
    status: 200,
    description: 'Item scanné avec succès',
    type: ScanTreasureItemResponseDto,
  })
  async scanItem(@Req() req: any, @Body() dto: ScanTreasureItemDto) {
    return this.treasureHuntService.scanTreasureItem(req.user.id, dto);
  }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new FileUploadService().getImageMulterConfig('treasure'),
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload treasure item image',
    description:
      'Upload an image for a treasure item (jpg, png, webp, max 5MB)',
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
        imageUrl: 'http://localhost:3000/uploads/images/treasure/abc123.jpg',
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
      'treasure',
      baseUrl,
    );

    return {
      filename: file.filename,
      imageUrl,
    };
  }
}
