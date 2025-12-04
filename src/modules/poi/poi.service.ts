import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PointOfInterest } from './entities/point-of-interest.entity';
import { CreatePOIDto, UpdatePOIDto } from './dto/poi.dto';
import {
  PaginationDto,
  PaginatedResponse,
  createPaginatedResponse,
} from '@/common/dto/pagination.dto';

@Injectable()
export class PoiService {
  constructor(
    @InjectModel(PointOfInterest)
    private poiModel: typeof PointOfInterest,
  ) {}

  async create(createDto: CreatePOIDto): Promise<PointOfInterest> {
    return this.poiModel.create(createDto as any);
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
}
