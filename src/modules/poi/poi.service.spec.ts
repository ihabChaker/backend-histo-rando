import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { PoiService } from './poi.service';
import { PointOfInterest } from './entities/point-of-interest.entity';
import { UserPOIVisit } from '@/modules/activity/entities/user-poi-visit.entity';
import { User } from '@/modules/users/entities/user.entity';
import { ActiveParcoursSession } from '@/modules/parcours-session/entities/active-parcours-session.entity';
import { CreatePOIDto, UpdatePOIDto } from './dto/poi.dto';

describe('PoiService', () => {
  let service: PoiService;
  let poiModel: any;
  let visitModel: any;
  let userModel: any;
  let sessionModel: any;

  beforeEach(async () => {
    poiModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
    };

    visitModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    userModel = {
      findByPk: jest.fn(),
    };

    sessionModel = {
      findByPk: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoiService,
        {
          provide: getModelToken(PointOfInterest),
          useValue: poiModel,
        },
        {
          provide: getModelToken(UserPOIVisit),
          useValue: visitModel,
        },
        {
          provide: getModelToken(User),
          useValue: userModel,
        },
        {
          provide: getModelToken(ActiveParcoursSession),
          useValue: sessionModel,
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
      poiModel.findAndCountAll.mockResolvedValue({
        rows: mockPOIs,
        count: 1,
      });

      const result = await service.findAllByParcours(1);

      expect(poiModel.findAndCountAll).toHaveBeenCalled();
      expect(result.data).toEqual(mockPOIs);
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

  describe('scanQr', () => {
    it('should scan a valid QR code and create new visit', async () => {
      const userId = 1;
      const scanDto = { qrCode: 'test-qr-123' };

      const mockPOI = {
        id: 1,
        name: 'Test POI',
        qrCode: 'test-qr-123',
        toJSON: jest.fn().mockReturnValue({ id: 1, name: 'Test POI' }),
      };

      poiModel.findOne.mockResolvedValue(mockPOI);
      visitModel.findOne.mockResolvedValue(null);
      visitModel.create.mockResolvedValue({});
      userModel.findByPk.mockResolvedValue({
        totalPoints: 100,
        update: jest.fn(),
      });

      const result = await service.scanQr(userId, scanDto);

      expect(result).toBeDefined();
      expect(result.poi).toBeDefined();
      expect(result.isNewVisit).toBe(true);
      expect(result.pointsEarned).toBe(0);
      expect(visitModel.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid QR code', async () => {
      const userId = 1;
      const scanDto = { qrCode: 'invalid-qr' };

      poiModel.findOne.mockResolvedValue(null);

      await expect(service.scanQr(userId, scanDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle existing visit correctly', async () => {
      const userId = 1;
      const scanDto = { qrCode: 'test-qr-123' };

      const mockPOI = {
        id: 1,
        qrCode: 'test-qr-123',
        toJSON: jest.fn().mockReturnValue({ id: 1 }),
      };

      poiModel.findOne.mockResolvedValue(mockPOI);
      visitModel.findOne.mockResolvedValue({ id: 1 });

      const result = await service.scanQr(userId, scanDto);

      expect(result.isNewVisit).toBe(false);
      expect(visitModel.create).not.toHaveBeenCalled();
    });

    it('should link visit to session when sessionId provided', async () => {
      const userId = 1;
      const scanDto = { qrCode: 'test-qr-123', sessionId: 5 };

      const mockPOI = {
        id: 1,
        toJSON: jest.fn().mockReturnValue({ id: 1 }),
      };

      const mockSession = {
        id: 5,
        userId: 1,
        getPoisVisited: jest.fn().mockReturnValue([]),
        setPoisVisited: jest.fn(),
        save: jest.fn(),
      };

      poiModel.findOne.mockResolvedValue(mockPOI);
      visitModel.findOne.mockResolvedValue(null);
      visitModel.create.mockResolvedValue({});
      sessionModel.findByPk.mockResolvedValue(mockSession);

      await service.scanQr(userId, scanDto);

      expect(sessionModel.findByPk).toHaveBeenCalledWith(5);
      expect(mockSession.setPoisVisited).toHaveBeenCalledWith([1]);
      expect(mockSession.save).toHaveBeenCalled();
    });
  });
});
