import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserProfileDto } from './dto/user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  beforeEach(async () => {
    userModel = {
      findByPk: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: userModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: 1, username: 'test', email: 'test@test.com' };
      userModel.findByPk.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(userModel.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      userModel.findByPk.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: 1, email: 'test@test.com' };
      userModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@test.com');

      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const mockUser = {
        id: 1,
        update: jest.fn().mockResolvedValue(undefined),
      };
      userModel.findByPk.mockResolvedValue(mockUser);

      const updateDto: UpdateUserProfileDto = { firstName: 'Updated' };
      await service.updateProfile(1, updateDto);

      expect(mockUser.update).toHaveBeenCalledWith(updateDto);
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockUser = {
        totalPoints: 100,
        totalKm: 10.5,
        username: 'test',
        isPmr: false,
      };
      userModel.findByPk.mockResolvedValue(mockUser);

      const result = await service.getUserStats(1);

      expect(result).toEqual({
        totalPoints: 100,
        totalKm: 10.5,
        username: 'test',
        isPmr: false,
      });
    });
  });

  describe('addPoints', () => {
    it('should add points to user', async () => {
      const mockUser = {
        totalPoints: 100,
        save: jest.fn().mockResolvedValue(undefined),
      };
      userModel.findByPk.mockResolvedValue(mockUser);

      await service.addPoints(1, 50);

      expect(mockUser.totalPoints).toBe(150);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('addKilometers', () => {
    it('should add kilometers to user', async () => {
      const mockUser = {
        totalKm: 10.5,
        save: jest.fn().mockResolvedValue(undefined),
      };
      userModel.findByPk.mockResolvedValue(mockUser);

      await service.addKilometers(1, 5.5);

      expect(mockUser.totalKm).toBe(16);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});
