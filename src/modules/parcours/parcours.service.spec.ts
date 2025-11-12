import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/sequelize";
import { NotFoundException } from "@nestjs/common";
import { ParcoursService } from "./parcours.service";
import { Parcours } from "./entities/parcours.entity";
import { CreateParcoursDto, UpdateParcoursDto } from "./dto/parcours.dto";

describe("ParcoursService", () => {
  let service: ParcoursService;
  let parcoursModel: any;

  beforeEach(async () => {
    parcoursModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParcoursService,
        {
          provide: getModelToken(Parcours),
          useValue: parcoursModel,
        },
      ],
    }).compile();

    service = module.get<ParcoursService>(ParcoursService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new parcours", async () => {
      const createDto: CreateParcoursDto = {
        name: "Test",
        description: "Test desc",
        difficultyLevel: "easy",
        distanceKm: 10,
        estimatedDuration: 120,
        historicalTheme: "Test",
        startingPointLat: 49.34,
        startingPointLon: -0.85,
      };

      const mockResult = { id: 1, ...createDto };
      parcoursModel.create.mockResolvedValue(mockResult);

      const result = await service.create(createDto);

      expect(parcoursModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe("findAll", () => {
    it("should return all parcours", async () => {
      const mockParcours = [{ id: 1, name: "Test" }];
      parcoursModel.findAll.mockResolvedValue(mockParcours);

      const result = await service.findAll();

      expect(parcoursModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockParcours);
    });

    it("should filter by distance range with minDistance", async () => {
      const mockParcours = [{ id: 1, name: "Test" }];
      parcoursModel.findAll.mockResolvedValue(mockParcours);

      const query = { minDistance: 5 };
      const result = await service.findAll(query);

      expect(parcoursModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockParcours);
    });

    it("should filter by distance range with maxDistance", async () => {
      const mockParcours = [{ id: 1, name: "Test" }];
      parcoursModel.findAll.mockResolvedValue(mockParcours);

      const query = { maxDistance: 10 };
      const result = await service.findAll(query);

      expect(parcoursModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockParcours);
    });

    it("should filter by distance range with both min and max", async () => {
      const mockParcours = [{ id: 1, name: "Test" }];
      parcoursModel.findAll.mockResolvedValue(mockParcours);

      const query = { minDistance: 5, maxDistance: 10 };
      const result = await service.findAll(query);

      expect(parcoursModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockParcours);
    });

    it("should filter by difficultyLevel", async () => {
      const mockParcours = [{ id: 1, name: "Test" }];
      parcoursModel.findAll.mockResolvedValue(mockParcours);

      const query = { difficultyLevel: "EASY" as any };
      const result = await service.findAll(query);

      expect(parcoursModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockParcours);
    });

    it("should filter by isPmrAccessible", async () => {
      const mockParcours = [{ id: 1, name: "Test" }];
      parcoursModel.findAll.mockResolvedValue(mockParcours);

      const query = { isPmrAccessible: true };
      const result = await service.findAll(query);

      expect(parcoursModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockParcours);
    });

    it("should filter by isActive", async () => {
      const mockParcours = [{ id: 1, name: "Test" }];
      parcoursModel.findAll.mockResolvedValue(mockParcours);

      const query = { isActive: false };
      const result = await service.findAll(query);

      expect(parcoursModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockParcours);
    });
  });

  describe("findOne", () => {
    it("should return a parcours by id", async () => {
      const mockParcours = { id: 1, name: "Test" };
      parcoursModel.findByPk.mockResolvedValue(mockParcours);

      const result = await service.findOne(1);

      expect(result).toEqual(mockParcours);
    });

    it("should throw NotFoundException when not found", async () => {
      parcoursModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a parcours", async () => {
      const mockParcours = {
        id: 1,
        update: jest.fn().mockResolvedValue(undefined),
      };
      parcoursModel.findByPk.mockResolvedValue(mockParcours);

      const updateDto: UpdateParcoursDto = { name: "Updated" };
      await service.update(1, updateDto);

      expect(mockParcours.update).toHaveBeenCalledWith(updateDto);
    });
  });

  describe("remove", () => {
    it("should remove a parcours", async () => {
      const mockParcours = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      parcoursModel.findByPk.mockResolvedValue(mockParcours);

      await service.remove(1);

      expect(mockParcours.destroy).toHaveBeenCalled();
    });
  });

  describe("findNearby", () => {
    it("should find nearby parcours", async () => {
      const mockParcours = [{ id: 1 }];
      parcoursModel.findAll.mockResolvedValue(mockParcours);

      const result = await service.findNearby(49.34, -0.85, 50);

      expect(parcoursModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockParcours);
    });
  });
});
