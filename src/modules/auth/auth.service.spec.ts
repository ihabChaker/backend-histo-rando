import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/sequelize";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { User } from "../users/entities/user.entity";
import { RegisterDto, LoginDto } from "./dto/auth.dto";
import { createMockModel } from "@/test-utils/mocks/sequelize.mock";
import { mockUser } from "@/test-utils/fixtures/user.fixture";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;
  let userModel: ReturnType<typeof createMockModel>;
  let jwtService: JwtService;

  beforeEach(async () => {
    userModel = createMockModel<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User),
          useValue: userModel,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue("mock-jwt-token"),
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    const registerDto: RegisterDto = {
      email: "newuser@example.com",
      username: "newuser",
      password: "password123",
      firstName: "New",
      lastName: "User",
      isPmr: false,
    };

    it("should successfully register a new user", async () => {
      userModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      userModel.create.mockResolvedValue({
        id: 1,
        email: registerDto.email,
        username: registerDto.username,
        passwordHash: "hashed-password",
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });

      const result = await service.register(registerDto);

      expect(userModel.findOne).toHaveBeenCalledTimes(2);
      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { username: registerDto.username },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(userModel.create).toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(result).toEqual({
        access_token: "mock-jwt-token",
        user: {
          id: 1,
          email: registerDto.email,
          username: registerDto.username,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        },
      });
    });

    it("should throw ConflictException if email already exists", async () => {
      userModel.findOne.mockResolvedValueOnce(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException("Email déjà utilisé")
      );

      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it("should throw ConflictException if username already exists", async () => {
      userModel.findOne
        .mockResolvedValueOnce(null) // email check passes
        .mockResolvedValueOnce(mockUser); // username check fails

      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException("Nom d'utilisateur déjà pris")
      );

      expect(userModel.findOne).toHaveBeenCalledTimes(2);
      expect(userModel.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    const loginDto: LoginDto = {
      email: "test@example.com",
      password: "password123",
    };

    it("should successfully login a user", async () => {
      userModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      });
      expect(result).toEqual({
        access_token: "mock-jwt-token",
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      });
    });

    it("should throw UnauthorizedException if user not found", async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException("Email ou mot de passe incorrect")
      );

      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException if password is incorrect", async () => {
      userModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException("Email ou mot de passe incorrect")
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe("validateUser", () => {
    it("should return user if found", async () => {
      userModel.findByPk.mockResolvedValue(mockUser);

      const result = await service.validateUser(mockUser.id);

      expect(userModel.findByPk).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      userModel.findByPk.mockResolvedValue(null);

      const result = await service.validateUser(999);

      expect(userModel.findByPk).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });
});
