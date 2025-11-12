import { Test, TestingModule } from '@nestjs/testing';
import { ParcoursController } from './parcours.controller';
import { ParcoursService } from './parcours.service';
import {
  CreateParcoursDto,
  UpdateParcoursDto,
  ParcoursQueryDto,
} from './dto/parcours.dto';
import {
  mockParcours,
  mockParcours2,
} from '@/test-utils/fixtures/parcours.fixture';

describe('ParcoursController', () => {
  let controller: ParcoursController;
  let parcoursService: ParcoursService;

  const mockParcoursService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findNearby: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParcoursController],
      providers: [
        {
          provide: ParcoursService,
          useValue: mockParcoursService,
        },
      ],
    }).compile();

    controller = module.get<ParcoursController>(ParcoursController);
    parcoursService = module.get<ParcoursService>(ParcoursService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new parcours', async () => {
      const createDto: CreateParcoursDto = {
        name: 'Test Parcours',
        description: 'Test description',
        difficultyLevel: 'medium',
        distanceKm: 10,
        estimatedDuration: 120,
        isPmrAccessible: true,
        historicalTheme: 'D-Day',
        startingPointLat: 49.3394,
        startingPointLon: -0.8566,
      };

      mockParcoursService.create.mockResolvedValue(mockParcours);

      const result = await controller.create(createDto);

      expect(parcoursService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockParcours);
    });
  });

  describe('findAll', () => {
    it('should return all parcours', async () => {
      const query: ParcoursQueryDto = {};
      mockParcoursService.findAll.mockResolvedValue([
        mockParcours,
        mockParcours2,
      ]);

      const result = await controller.findAll(query);

      expect(parcoursService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual([mockParcours, mockParcours2]);
    });

    it('should return filtered parcours', async () => {
      const query: ParcoursQueryDto = {
        difficultyLevel: 'medium',
        isPmrAccessible: true,
      };
      mockParcoursService.findAll.mockResolvedValue([mockParcours]);

      const result = await controller.findAll(query);

      expect(parcoursService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual([mockParcours]);
    });
  });

  describe('findNearby', () => {
    it('should find nearby parcours with default radius', async () => {
      const lat = 49.3394;
      const lon = -0.8566;

      mockParcoursService.findNearby.mockResolvedValue([mockParcours]);

      const result = await controller.findNearby(lat, lon);

      expect(parcoursService.findNearby).toHaveBeenCalledWith(lat, lon, 50);
      expect(result).toEqual([mockParcours]);
    });

    it('should find nearby parcours with custom radius', async () => {
      const lat = 49.3394;
      const lon = -0.8566;
      const radius = 20;

      mockParcoursService.findNearby.mockResolvedValue([
        mockParcours,
        mockParcours2,
      ]);

      const result = await controller.findNearby(lat, lon, radius);

      expect(parcoursService.findNearby).toHaveBeenCalledWith(lat, lon, radius);
      expect(result).toEqual([mockParcours, mockParcours2]);
    });
  });

  describe('findOne', () => {
    it('should return a parcours by id', async () => {
      mockParcoursService.findOne.mockResolvedValue(mockParcours);

      const result = await controller.findOne(1);

      expect(parcoursService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockParcours);
    });
  });

  describe('update', () => {
    it('should update a parcours', async () => {
      const updateDto: UpdateParcoursDto = {
        name: 'Updated Name',
      };

      const updatedParcours = { ...mockParcours, ...updateDto };
      mockParcoursService.update.mockResolvedValue(updatedParcours);

      const result = await controller.update(1, updateDto);

      expect(parcoursService.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedParcours);
    });
  });

  describe('remove', () => {
    it('should remove a parcours', async () => {
      mockParcoursService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(parcoursService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Parcours supprimé avec succès' });
    });
  });
});
