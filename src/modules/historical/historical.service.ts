import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  PaginationDto,
  PaginatedResponse,
  createPaginatedResponse,
} from '@/common/dto/pagination.dto';
import { HistoricalBattalion } from './entities/historical-battalion.entity';
import { BattalionRoute } from './entities/battalion-route.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import {
  CreateBattalionDto,
  UpdateBattalionDto,
  CreateBattalionRouteDto,
  UpdateBattalionRouteDto,
} from './dto/historical.dto';

@Injectable()
export class HistoricalService {
  constructor(
    @InjectModel(HistoricalBattalion)
    private battalionModel: typeof HistoricalBattalion,
    @InjectModel(BattalionRoute)
    private battalionRouteModel: typeof BattalionRoute,
    @InjectModel(Parcours) private parcoursModel: typeof Parcours,
  ) {}

  // Battalion CRUD
  async createBattalion(
    createDto: CreateBattalionDto,
  ): Promise<HistoricalBattalion> {
    return this.battalionModel.create(createDto as any);
  }

  async findAllBattalions(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<HistoricalBattalion>> {
    const { rows, count } = await this.battalionModel.findAndCountAll({
      include: [{ model: BattalionRoute, include: [Parcours] }],
      order: [['name', 'ASC']],
      limit: pagination.take,
      offset: pagination.skip,
    });
    return createPaginatedResponse(rows, count, pagination);
  }

  async findOneBattalion(id: number): Promise<HistoricalBattalion> {
    const battalion = await this.battalionModel.findByPk(id, {
      include: [{ model: BattalionRoute, include: [Parcours] }],
    });
    if (!battalion) {
      throw new NotFoundException(`Battalion with ID ${id} not found`);
    }
    return battalion;
  }

  async updateBattalion(
    id: number,
    updateDto: UpdateBattalionDto,
  ): Promise<HistoricalBattalion> {
    const battalion = await this.findOneBattalion(id);
    await battalion.update(updateDto);
    return battalion;
  }

  async removeBattalion(id: number): Promise<void> {
    const battalion = await this.findOneBattalion(id);
    await battalion.destroy();
  }

  // Battalion Route CRUD
  async createBattalionRoute(
    createDto: CreateBattalionRouteDto,
  ): Promise<BattalionRoute> {
    // Verify battalion and parcours exist
    await this.findOneBattalion(createDto.battalionId);
    const parcours = await this.parcoursModel.findByPk(createDto.parcoursId);
    if (!parcours) {
      throw new NotFoundException(
        `Parcours with ID ${createDto.parcoursId} not found`,
      );
    }

    return this.battalionRouteModel.create(createDto as any);
  }

  async findRoutesByBattalion(
    battalionId: number,
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<BattalionRoute>> {
    const { rows, count } = await this.battalionRouteModel.findAndCountAll({
      where: { battalionId },
      include: [Parcours],
      order: [['routeDate', 'ASC']],
      limit: pagination.take,
      offset: pagination.skip,
    });
    return createPaginatedResponse(rows, count, pagination);
  }

  async findRoutesByParcours(
    parcoursId: number,
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<BattalionRoute>> {
    const { rows, count } = await this.battalionRouteModel.findAndCountAll({
      where: { parcoursId },
      include: [HistoricalBattalion],
      order: [['routeDate', 'ASC']],
      limit: pagination.take,
      offset: pagination.skip,
    });
    return createPaginatedResponse(rows, count, pagination);
  }

  async updateBattalionRoute(
    id: number,
    updateDto: UpdateBattalionRouteDto,
  ): Promise<BattalionRoute> {
    const route = await this.battalionRouteModel.findByPk(id);
    if (!route) {
      throw new NotFoundException(`Battalion route with ID ${id} not found`);
    }
    await route.update(updateDto);
    return route;
  }

  async removeBattalionRoute(id: number): Promise<void> {
    const route = await this.battalionRouteModel.findByPk(id);
    if (!route) {
      throw new NotFoundException(`Battalion route with ID ${id} not found`);
    }
    await route.destroy();
  }
}
