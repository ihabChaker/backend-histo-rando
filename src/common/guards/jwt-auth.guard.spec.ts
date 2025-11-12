import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (
    authHeader?: string
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: authHeader,
          },
          user: undefined,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe("canActivate", () => {
    it("should allow access to public routes", async () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);

      const result = await guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(result).toBe(true);
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it("should allow access with valid token", async () => {
      const payload = {
        sub: 1,
        email: "test@example.com",
        username: "testuser",
      };
      const mockRequest = {
        headers: {
          authorization: "Bearer valid-token",
        },
        user: undefined,
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
      jest.spyOn(jwtService, "verifyAsync").mockResolvedValue(payload);

      const result = await guard.canActivate(context);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith("valid-token");
      expect(mockRequest.user).toEqual(payload);
      expect(result).toBe(true);
    });
    it("should throw UnauthorizedException if no token provided", async () => {
      const context = createMockExecutionContext();

      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException("Token manquant")
      );
    });

    it("should throw UnauthorizedException if token is invalid", async () => {
      const context = createMockExecutionContext("Bearer invalid-token");

      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
      jest
        .spyOn(jwtService, "verifyAsync")
        .mockRejectedValue(new Error("Invalid token"));

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException("Token invalide ou expiré")
      );
    });

    it("should throw UnauthorizedException if authorization header is malformed", async () => {
      const context = createMockExecutionContext("InvalidFormat token");

      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException("Token manquant")
      );
    });

    it("should throw UnauthorizedException if only Bearer is provided without token", async () => {
      const context = createMockExecutionContext("Bearer ");

      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException("Token manquant")
      );
    });
  });
});
