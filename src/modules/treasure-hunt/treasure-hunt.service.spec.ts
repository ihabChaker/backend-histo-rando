import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { TreasureHuntService } from './treasure-hunt.service';
import { TreasureHunt } from './entities/treasure-hunt.entity';
import { TreasureItem } from './entities/treasure-item.entity';
import { UserTreasureFound } from './entities/user-treasure-found.entity';
import { UserTreasureItemFound } from './entities/user-treasure-item-found.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import {
  CreateTreasureItemDto,
  ScanTreasureItemDto,
} from './dto/treasure-item.dto';

describe('TreasureHuntService', () => {
  let service: TreasureHuntService;
  let treasureHuntModel: any;
  let treasureItemModel: any;
  let userTreasureFoundModel: any;
  let userTreasureItemFoundModel: any;
  let parcoursModel: any;
  let userModel: any;

  beforeEach(async () => {
    treasureHuntModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
      findByPk: jest.fn(),
    };

    treasureItemModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
    };

    userTreasureFoundModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    userTreasureItemFoundModel = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
    };

    userModel = {
      findByPk: jest.fn(),
    };

    parcoursModel = {
      findByPk: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreasureHuntService,
        {
          provide: getModelToken(TreasureHunt),
          useValue: treasureHuntModel,
        },
        {
          provide: getModelToken(TreasureItem),
          useValue: treasureItemModel,
        },
        {
          provide: getModelToken(UserTreasureFound),
          useValue: userTreasureFoundModel,
        },
        {
          provide: getModelToken(UserTreasureItemFound),
          useValue: userTreasureItemFoundModel,
        },
        {
          provide: getModelToken(Parcours),
          useValue: parcoursModel,
        },
        {
          provide: getModelToken(User),
          useValue: userModel,
        },
      ],
    }).compile();

    service = module.get<TreasureHuntService>(TreasureHuntService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTreasureItem', () => {
    it('should create a treasure item with generated QR code', async () => {
      const createDto: CreateTreasureItemDto = {
        treasureHuntId: 1,
        itemName: 'Test Item',
        description: 'Test Description',
        pointsValue: 10,
      };

      const mockHunt = { id: 1, name: 'Test Hunt' };
      const mockItem = {
        id: 1,
        ...createDto,
        qrCode: expect.any(String),
      };

      treasureHuntModel.findByPk.mockResolvedValue(mockHunt);
      treasureItemModel.create.mockResolvedValue(mockItem);

      const result = await service.createTreasureItem(createDto);

      expect(treasureItemModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockItem);
    });
  });

  describe('findItemsByHunt', () => {
    it('should return all items for a treasure hunt', async () => {
      const mockItems = [
        { id: 1, itemName: 'Item 1' },
        { id: 2, itemName: 'Item 2' },
      ];

      treasureItemModel.findAll.mockResolvedValue(mockItems);

      const result = await service.findItemsByHunt(1);

      expect(result).toEqual(mockItems);
      expect(treasureItemModel.findAll).toHaveBeenCalledWith({
        where: { treasureHuntId: 1 },
        order: [['id', 'ASC']],
      });
    });
  });

  describe('scanTreasureItem', () => {
    it('should scan a new treasure item and award points', async () => {
      const userId = 1;
      const scanDto = { qrCode: 'test-qr-123' };

      const mockItem = {
        id: 1,
        treasureHuntId: 1,
        pointsValue: 25,
        qrCode: 'test-qr-123',
        treasureHunt: {
          id: 1,
          name: 'Test Hunt',
          toJSON: jest.fn().mockReturnValue({ id: 1, name: 'Test Hunt' }),
        },
        toJSON: jest.fn().mockReturnValue({ id: 1, name: 'Test Item' }),
      };

      const mockUser = {
        id: userId,
        totalPoints: 100,
        update: jest.fn(),
      };

      treasureItemModel.findOne.mockResolvedValue(mockItem);
      userTreasureItemFoundModel.findOne.mockResolvedValue(null);
      userTreasureItemFoundModel.create.mockResolvedValue({});
      userModel.findByPk.mockResolvedValue(mockUser);

      // Mock for completion check
      treasureItemModel.findAll.mockResolvedValue([mockItem]);
      userTreasureItemFoundModel.findAll.mockResolvedValue([
        { treasureItemId: 1 },
      ]);

      const result = await service.scanTreasureItem(userId, scanDto);

      expect(result).toBeDefined();
      expect(result.isNewFind).toBe(true);
      expect(result.item).toBeDefined();
      expect(userTreasureItemFoundModel.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid QR code', async () => {
      const userId = 1;
      const scanDto = { qrCode: 'invalid-qr' };

      treasureItemModel.findOne.mockResolvedValue(null);

      await expect(service.scanTreasureItem(userId, scanDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not award points for duplicate scan', async () => {
      const userId = 1;
      const scanDto = { qrCode: 'test-qr-123' };

      const mockItem = {
        id: 1,
        treasureHuntId: 1,
        pointsValue: 25,
        treasureHunt: {
          toJSON: jest.fn().mockReturnValue({ id: 1 }),
        },
        toJSON: jest.fn().mockReturnValue({ id: 1 }),
      };

      treasureItemModel.findOne.mockResolvedValue(mockItem);
      userTreasureItemFoundModel.findOne.mockResolvedValue({ id: 1 }); // Already found
      treasureItemModel.findAll.mockResolvedValue([mockItem]);
      userTreasureItemFoundModel.findAll.mockResolvedValue([
        { treasureItemId: 1 },
      ]);

      const result = await service.scanTreasureItem(userId, scanDto);

      expect(result.isNewFind).toBe(false);
      expect(result.pointsEarned).toBe(0);
      expect(userTreasureItemFoundModel.create).not.toHaveBeenCalled();
    });
  });
});
