import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UpdateUserProfileDto } from "./dto/user.dto";
import { JwtPayload } from "@/common/types/auth.types";
import { mockUser } from "@/test-utils/fixtures/user.fixture";

describe("UsersController", () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    updateProfile: jest.fn(),
    getUserStats: jest.fn(),
    addPoints: jest.fn(),
    addKilometers: jest.fn(),
  };

  const mockJwtPayload: JwtPayload = {
    sub: 1,
    email: "test@example.com",
    username: "testuser",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("should return current user profile", async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getCurrentUser(mockJwtPayload);

      expect(usersService.findById).toHaveBeenCalledWith(mockJwtPayload.sub);
      expect(result).toEqual(mockUser);
    });
  });

  describe("getUserStats", () => {
    it("should return user statistics", async () => {
      const stats = {
        totalPoints: 100,
        totalKm: 10.5,
        username: "testuser",
        isPmr: false,
      };

      mockUsersService.getUserStats.mockResolvedValue(stats);

      const result = await controller.getUserStats(mockJwtPayload);

      expect(usersService.getUserStats).toHaveBeenCalledWith(
        mockJwtPayload.sub
      );
      expect(result).toEqual(stats);
    });
  });

  describe("updateProfile", () => {
    it("should update user profile", async () => {
      const updateDto: UpdateUserProfileDto = {
        firstName: "Updated",
        lastName: "Name",
      };

      const updatedUser = { ...mockUser, ...updateDto };
      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockJwtPayload, updateDto);

      expect(usersService.updateProfile).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        updateDto
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getUserById(1);

      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });
});
