import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  PaginationDto,
  PaginatedResponse,
  createPaginatedResponse,
} from '@/common/dto/pagination.dto';
import { TreasureHunt } from './entities/treasure-hunt.entity';
import { UserTreasureFound } from './entities/user-treasure-found.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import { User } from '@/modules/users/entities/user.entity';
import {
  CreateTreasureHuntDto,
  UpdateTreasureHuntDto,
  RecordTreasureFoundDto,
} from './dto/treasure-hunt.dto';

@Injectable()
export class TreasureHuntService {
  constructor(
    @InjectModel(TreasureHunt) private treasureHuntModel: typeof TreasureHunt,
    @InjectModel(UserTreasureFound)
    private treasureFoundModel: typeof UserTreasureFound,
    @InjectModel(Parcours) private parcoursModel: typeof Parcours,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  async createTreasureHunt(
    createDto: CreateTreasureHuntDto,
  ): Promise<TreasureHunt> {
    const parcours = await this.parcoursModel.findByPk(createDto.parcoursId);
    if (!parcours) {
      throw new NotFoundException(
        `Parcours with ID ${createDto.parcoursId} not found`,
      );
    }
    return this.treasureHuntModel.create(createDto as any);
  }

  async findAllTreasureHunts(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<TreasureHunt>> {
    const { rows, count } = await this.treasureHuntModel.findAndCountAll({
      include: [Parcours],
      order: [['pointsReward', 'DESC']],
      limit: pagination.take,
      offset: pagination.skip,
    });
    return createPaginatedResponse(rows, count, pagination);
  }

  async findTreasureHuntsByParcours(
    parcoursId: number,
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<TreasureHunt>> {
    const { rows, count } = await this.treasureHuntModel.findAndCountAll({
      where: { parcoursId, isActive: true },
      include: [Parcours],
      limit: pagination.take,
      offset: pagination.skip,
    });
    return createPaginatedResponse(rows, count, pagination);
  }

  async findOneTreasureHunt(id: number): Promise<TreasureHunt> {
    const treasure = await this.treasureHuntModel.findByPk(id, {
      include: [Parcours],
    });
    if (!treasure) {
      throw new NotFoundException(`Treasure hunt with ID ${id} not found`);
    }
    return treasure;
  }

  async updateTreasureHunt(
    id: number,
    updateDto: UpdateTreasureHuntDto,
  ): Promise<TreasureHunt> {
    const treasure = await this.findOneTreasureHunt(id);
    await treasure.update(updateDto);
    return treasure;
  }

  async removeTreasureHunt(id: number): Promise<void> {
    const treasure = await this.findOneTreasureHunt(id);
    await treasure.destroy();
  }

  async recordTreasureFound(
    userId: number,
    dto: RecordTreasureFoundDto,
  ): Promise<any> {
    let treasure: TreasureHunt | null = null;

    if (dto.qrCode) {
      // Find by QR Code
      treasure = await this.treasureHuntModel.findOne({
        where: { qrCode: dto.qrCode },
      });

      if (!treasure) {
        throw new NotFoundException('Invalid QR Code');
      }

      if (dto.treasureId && treasure.id !== dto.treasureId) {
        throw new BadRequestException(
          'QR Code does not match the specified treasure',
        );
      }
    } else if (dto.treasureId) {
      // Find by ID
      treasure = await this.findOneTreasureHunt(dto.treasureId);

      // Verify user is within scan radius ONLY if not using QR code (or we could enforce both)
      // For now, let's assume QR code proves presence, but if no QR code, we need location.
      const distance = this.calculateDistance(
        dto.latitude,
        dto.longitude,
        treasure.latitude,
        treasure.longitude,
      );

      if (distance > treasure.scanRadiusMeters) {
        throw new BadRequestException(
          `You are too far from the treasure (${Math.round(distance)}m away, need to be within ${treasure.scanRadiusMeters}m)`,
        );
      }
    } else {
      throw new BadRequestException(
        'Either treasureId or qrCode must be provided',
      );
    }

    // Check if already found by this user
    const existing = await this.treasureFoundModel.findOne({
      where: { userId, treasureId: treasure.id },
    });

    if (existing) {
      throw new ConflictException('You have already found this treasure');
    }

    // Record the find
    const found = await this.treasureFoundModel.create({
      userId,
      treasureId: treasure.id,
      foundDatetime: new Date(),
      pointsEarned: treasure.pointsReward,
    } as any);

    // Update user points
    const user = await this.userModel.findByPk(userId);
    if (user) {
      await user.update({
        totalPoints: user.totalPoints + treasure.pointsReward,
      });
    }

    return {
      found,
      message: 'Félicitations ! Vous avez trouvé le trésor !',
      pointsEarned: treasure.pointsReward,
    };
  }

  async getUserTreasuresFound(
    userId: number,
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<UserTreasureFound>> {
    const { rows, count } = await this.treasureFoundModel.findAndCountAll({
      where: { userId },
      include: [TreasureHunt],
      order: [['foundDatetime', 'DESC']],
      limit: pagination.take,
      offset: pagination.skip,
    });
    return createPaginatedResponse(rows, count, pagination);
  }
}
