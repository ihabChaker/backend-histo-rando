import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PointOfInterest } from './entities/point-of-interest.entity';
import { CreatePOIDto, UpdatePOIDto } from './dto/poi.dto';
import { ScanQrDto, ScanQrResponseDto } from './dto/scan-qr.dto';
import {
  PaginationDto,
  PaginatedResponse,
  createPaginatedResponse,
} from '@/common/dto/pagination.dto';
import { UserPOIVisit } from '@/modules/activity/entities/user-poi-visit.entity';
import { Quiz } from '@/modules/quiz/entities/quiz.entity';
import { Podcast } from '@/modules/media/entities/podcast.entity';
import { User } from '@/modules/users/entities/user.entity';
import { ActiveParcoursSession } from '@/modules/parcours-session/entities/active-parcours-session.entity';

@Injectable()
export class PoiService {
  private readonly logger = new Logger(PoiService.name);

  constructor(
    @InjectModel(PointOfInterest)
    private poiModel: typeof PointOfInterest,
    @InjectModel(UserPOIVisit)
    private userPOIVisitModel: typeof UserPOIVisit,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(ActiveParcoursSession)
    private sessionModel: typeof ActiveParcoursSession,
  ) {}

  async create(createDto: CreatePOIDto): Promise<PointOfInterest> {
    // Generate a unique QR code if not provided
    const qrCode =
      createDto['qrCode'] ||
      `POI-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    return this.poiModel.create({
      ...createDto,
      qrCode,
    } as any);
  }

  async findAll(
    pagination?: PaginationDto,
  ): Promise<PaginatedResponse<PointOfInterest>> {
    const { count, rows } = await this.poiModel.findAndCountAll({
      order: [['id', 'DESC']],
      limit: pagination?.take,
      offset: pagination?.skip,
    });

    return createPaginatedResponse(
      rows,
      count,
      pagination || new PaginationDto(),
    );
  }

  async findAllByParcours(
    parcoursId: number,
    pagination?: PaginationDto,
  ): Promise<PaginatedResponse<PointOfInterest>> {
    const { count, rows } = await this.poiModel.findAndCountAll({
      where: { parcoursId },
      order: [['orderInParcours', 'ASC']],
      limit: pagination?.take,
      offset: pagination?.skip,
    });

    return createPaginatedResponse(
      rows,
      count,
      pagination || new PaginationDto(),
    );
  }

  async findOne(id: number): Promise<PointOfInterest> {
    const poi = await this.poiModel.findByPk(id);
    if (!poi) {
      throw new NotFoundException(`POI avec l'ID ${id} non trouvé`);
    }
    return poi;
  }

  async update(id: number, updateDto: UpdatePOIDto): Promise<PointOfInterest> {
    const poi = await this.findOne(id);
    await poi.update(updateDto as any);
    return poi;
  }

  async remove(id: number): Promise<void> {
    const poi = await this.findOne(id);
    await poi.destroy();
  }

  async scanQr(userId: number, scanDto: ScanQrDto): Promise<ScanQrResponseDto> {
    this.logger.log(`Scanning QR code: ${scanDto.qrCode} for user: ${userId}`);

    // Find POI by QR code
    const poi = await this.poiModel.findOne({
      where: { qrCode: scanDto.qrCode },
      include: [Quiz, Podcast],
    });

    if (!poi) {
      this.logger.warn(`POI not found for QR code: ${scanDto.qrCode}`);
      throw new NotFoundException('QR code invalide ou POI non trouvé');
    }

    this.logger.log(`Found POI: ${poi.id} - ${poi.name}`);

    // Check if this is a new visit
    const existingVisit = await this.userPOIVisitModel.findOne({
      where: {
        userId,
        poiId: poi.id,
      },
    });

    const isNewVisit = !existingVisit;
    const pointsEarned = 0; // POI visits themselves don't earn points, only quizzes/activities do

    this.logger.log(
      `Visit status - isNew: ${isNewVisit}, points: ${pointsEarned}`,
    );

    // Create or update visit record
    if (isNewVisit) {
      await this.userPOIVisitModel.create({
        userId,
        poiId: poi.id,
        sessionId: scanDto.sessionId || null,
        visitDatetime: new Date(),
        scannedQr: true,
      } as any);

      this.logger.log(`Created new visit record for POI: ${poi.id}`);

      // Add POI to session's visited list if session provided
      if (scanDto.sessionId) {
        this.logger.log(`Linking visit to session: ${scanDto.sessionId}`);
        const session = await this.sessionModel.findByPk(scanDto.sessionId);
        if (session && session.userId === userId) {
          const visitedPOIs = session.getPoisVisited();
          if (!visitedPOIs.includes(poi.id)) {
            visitedPOIs.push(poi.id);
            session.setPoisVisited(visitedPOIs);
            await session.save();
            this.logger.log(
              `Added POI ${poi.id} to session ${scanDto.sessionId}`,
            );
          }
        } else {
          this.logger.warn(
            `Session ${scanDto.sessionId} not found or doesn't belong to user ${userId}`,
          );
        }
      }

      // Award points to user
      if (pointsEarned > 0) {
        const user = await this.userModel.findByPk(userId);
        if (user) {
          await user.update({
            totalPoints: (user.totalPoints || 0) + pointsEarned,
          });
          this.logger.log(`Awarded ${pointsEarned} points to user ${userId}`);
        }
      }
    } else {
      this.logger.log(`User ${userId} already visited POI ${poi.id}`);
    }

    return {
      poi: poi.toJSON(),
      quiz: poi.quiz?.toJSON(),
      podcast: poi.podcast?.toJSON(),
      pointsEarned,
      isNewVisit,
    };
  }
}
