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
import { RewardService } from './reward.service';
import {
  CreateRewardDto,
  UpdateRewardDto,
  RedeemRewardDto,
} from './dto/reward.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { FileUploadService } from '../file-upload/file-upload.service';

@ApiTags('rewards')
@ApiBearerAuth()
@Controller('rewards')
export class RewardController {
  constructor(
    private readonly rewardService: RewardService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle récompense' })
  @ApiResponse({ status: 201, description: 'Récompense créée' })
  async create(@Body() createDto: CreateRewardDto) {
    return this.rewardService.createReward(createDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lister toutes les récompenses disponibles' })
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
    description: 'Liste des récompenses',
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
    return this.rewardService.findAllRewards(pagination);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une récompense par ID' })
  @ApiParam({ name: 'id', description: 'ID de la récompense' })
  @ApiResponse({ status: 200, description: 'Récompense trouvée' })
  @ApiResponse({ status: 404, description: 'Récompense non trouvée' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rewardService.findOneReward(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une récompense' })
  @ApiParam({ name: 'id', description: 'ID de la récompense' })
  @ApiResponse({ status: 200, description: 'Récompense mise à jour' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRewardDto,
  ) {
    return this.rewardService.updateReward(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une récompense' })
  @ApiParam({ name: 'id', description: 'ID de la récompense' })
  @ApiResponse({ status: 200, description: 'Récompense supprimée' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.rewardService.removeReward(id);
    return { message: 'Récompense supprimée avec succès' };
  }

  @Post('redeem')
  @ApiOperation({
    summary: 'Échanger des points contre une récompense',
    description: 'Utiliser vos points pour obtenir une récompense',
  })
  @ApiResponse({
    status: 201,
    description: 'Récompense échangée',
    schema: {
      example: {
        redemption: {
          id: 1,
          userId: 1,
          rewardId: 1,
          redemptionDatetime: '2025-11-12T17:00:00Z',
          pointsSpent: 500,
          status: 'pending',
          redemptionCode: 'RWD-1731425000-ABC123',
        },
        message: 'Reward redeemed successfully',
        redemptionCode: 'RWD-1731425000-ABC123',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Points insuffisants ou stock épuisé',
  })
  async redeem(@CurrentUser() user: any, @Body() dto: RedeemRewardDto) {
    return this.rewardService.redeemReward(user.sub, dto);
  }

  @Get('redemptions/me')
  @ApiOperation({ summary: 'Obtenir mes échanges de récompenses' })
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
    description: 'Liste des échanges',
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
  async getUserRedemptions(
    @CurrentUser() user: any,
    @Query() pagination: PaginationDto,
  ) {
    return this.rewardService.getUserRedemptions(user.sub, pagination);
  }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new FileUploadService().getImageMulterConfig('rewards'),
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload reward image',
    description: 'Upload an image for a reward (jpg, png, webp, max 5MB)',
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
        imageUrl: 'http://localhost:3000/uploads/images/rewards/abc123.jpg',
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
      'rewards',
      baseUrl,
    );

    return {
      filename: file.filename,
      imageUrl,
    };
  }
}
