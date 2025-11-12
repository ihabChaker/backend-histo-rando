import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { PoiService } from './poi.service';
import { PointOfInterest } from './entities/point-of-interest.entity';
import { CreatePOIDto, UpdatePOIDto } from './dto/poi.dto';

describe('PoiService', () => {
  let service: PoiService;
  let poiModel: any;

  beforeEach(async () => {
    poiModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoiService,
        {
          provide: getModelToken(PointOfInterest),
          useValue: poiModel,
        },
      ],
    }).compile();

    service = module.get<PoiService>(PoiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new POI', async () => {
      const createDto: CreatePOIDto = {
        parcoursId: 1,
        name: 'Test POI',
        poiType: 'bunker',
        latitude: 49.34,
        longitude: -0.85,
        orderInParcours: 1,
      };

      const mockResult = { id: 1, ...createDto };
      poiModel.create.mockResolvedValue(mockResult);

      const result = await service.create(createDto);

      expect(poiModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAllByParcours', () => {
    it('should return all POIs for a parcours', async () => {
      const mockPOIs = [{ id: 1, name: 'Test POI' }];
      poiModel.findAll.mockResolvedValue(mockPOIs);

      const result = await service.findAllByParcours(1);

      expect(poiModel.findAll).toHaveBeenCalledWith({
        where: { parcoursId: 1 },
        order: [['orderInParcours', 'ASC']],
      });
      expect(result).toEqual(mockPOIs);
    });
  });

  describe('findOne', () => {
    it('should return a POI by id', async () => {
      const mockPOI = { id: 1, name: 'Test' };
      poiModel.findByPk.mockResolvedValue(mockPOI);

      const result = await service.findOne(1);

      expect(result).toEqual(mockPOI);
    });

    it('should throw NotFoundException when not found', async () => {
      poiModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a POI', async () => {
      const mockPOI = {
        id: 1,
        update: jest.fn().mockResolvedValue(undefined),
      };
      poiModel.findByPk.mockResolvedValue(mockPOI);

      const updateDto: UpdatePOIDto = { name: 'Updated' };
      await service.update(1, updateDto);

      expect(mockPOI.update).toHaveBeenCalledWith(updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a POI', async () => {
      const mockPOI = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      poiModel.findByPk.mockResolvedValue(mockPOI);

      await service.remove(1);

      expect(mockPOI.destroy).toHaveBeenCalled();
    });
  });
});
