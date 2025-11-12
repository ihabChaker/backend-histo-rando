import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PointOfInterest } from './entities/point-of-interest.entity';
import { CreatePOIDto, UpdatePOIDto } from './dto/poi.dto';

@Injectable()
export class PoiService {
  constructor(
    @InjectModel(PointOfInterest)
    private poiModel: typeof PointOfInterest,
  ) {}

  async create(createDto: CreatePOIDto): Promise<PointOfInterest> {
    return this.poiModel.create(createDto as any);
  }

  async findAllByParcours(parcoursId: number): Promise<PointOfInterest[]> {
    return this.poiModel.findAll({
      where: { parcoursId },
      order: [['orderInParcours', 'ASC']],
    });
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
