import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Parcours } from './entities/parcours.entity';
import {
  CreateParcoursDto,
  UpdateParcoursDto,
  ParcoursQueryDto,
} from './dto/parcours.dto';
import { PointOfInterest } from '@/modules/poi/entities/point-of-interest.entity';
import {
  PaginationDto,
  PaginatedResponse,
  createPaginatedResponse,
} from '@/common/dto/pagination.dto';

@Injectable()
export class ParcoursService {
  constructor(
    @InjectModel(Parcours)
    private parcoursModel: typeof Parcours,
  ) {}

  async create(createDto: CreateParcoursDto): Promise<Parcours> {
    return this.parcoursModel.create(createDto as any);
  }

  async findAll(
    query?: ParcoursQueryDto,
    pagination?: PaginationDto,
  ): Promise<PaginatedResponse<Parcours>> {
    const where: any = {};

    if (query) {
      if (query.difficultyLevel) where.difficultyLevel = query.difficultyLevel;
      if (query.isPmrAccessible !== undefined)
        where.isPmrAccessible = query.isPmrAccessible;
      if (query.isActive !== undefined) where.isActive = query.isActive;

      if (query.minDistance || query.maxDistance) {
        where.distanceKm = {};
        if (query.minDistance) where.distanceKm[Op.gte] = query.minDistance;
        if (query.maxDistance) where.distanceKm[Op.lte] = query.maxDistance;
      }
    }

    const { count, rows } = await this.parcoursModel.findAndCountAll({
      where,
      include: [PointOfInterest],
      order: [['creationDate', 'DESC']],
      limit: pagination?.take,
      offset: pagination?.skip,
    });

    return createPaginatedResponse(
      rows,
      count,
      pagination || new PaginationDto(),
    );
  }

  async findOne(id: number): Promise<Parcours> {
    const parcours = await this.parcoursModel.findByPk(id, {
      include: [PointOfInterest],
    });

    if (!parcours) {
      throw new NotFoundException(`Parcours avec l'ID ${id} non trouvé`);
    }

    return parcours;
  }

  async update(id: number, updateDto: UpdateParcoursDto): Promise<Parcours> {
    const parcours = await this.findOne(id);
    await parcours.update(updateDto as any);
    return parcours;
  }

  async remove(id: number): Promise<void> {
    const parcours = await this.findOne(id);
    await parcours.destroy();
  }

  async findNearby(
    lat: number,
    lon: number,
    radiusKm: number = 50,
  ): Promise<Parcours[]> {
    // Simple distance calculation (for production, use PostGIS)
    const latRange = radiusKm / 111.0; // rough conversion km to degrees
    const lonRange = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));

    return this.parcoursModel.findAll({
      where: {
        startingPointLat: {
          [Op.between]: [lat - latRange, lat + latRange],
        },
        startingPointLon: {
          [Op.between]: [lon - lonRange, lon + lonRange],
        },
        isActive: true,
      },
    });
  }
}
