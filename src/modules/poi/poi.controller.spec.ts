import { Test, TestingModule } from "@nestjs/testing";
import { PoiController } from "./poi.controller";
import { PoiService } from "./poi.service";
import { CreatePOIDto, UpdatePOIDto } from "./dto/poi.dto";
import { mockPOI, mockPOI2 } from "@/test-utils/fixtures/poi.fixture";

describe("PoiController", () => {
  let controller: PoiController;
  let poiService: PoiService;

  const mockPoiService = {
    create: jest.fn(),
    findAllByParcours: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoiController],
      providers: [
        {
          provide: PoiService,
          useValue: mockPoiService,
        },
      ],
    }).compile();

    controller = module.get<PoiController>(PoiController);
    poiService = module.get<PoiService>(PoiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new POI", async () => {
      const createDto: CreatePOIDto = {
        parcoursId: 1,
        name: "Test POI",
        description: "Test description",
        latitude: 49.34,
        longitude: -0.86,
        poiType: "bunker",
        historicalPeriod: "WW2",
        orderInParcours: 1,
      };

      mockPoiService.create.mockResolvedValue(mockPOI);

      const result = await controller.create(createDto);

      expect(poiService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockPOI);
    });
  });
  describe("findByParcours", () => {
    it("should return all POIs for a parcours", async () => {
      mockPoiService.findAllByParcours.mockResolvedValue([mockPOI, mockPOI2]);

      const result = await controller.findByParcours(1);

      expect(poiService.findAllByParcours).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockPOI, mockPOI2]);
    });
  });

  describe("findOne", () => {
    it("should return a POI by id", async () => {
      mockPoiService.findOne.mockResolvedValue(mockPOI);

      const result = await controller.findOne(1);

      expect(poiService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPOI);
    });
  });

  describe("update", () => {
    it("should update a POI", async () => {
      const updateDto: UpdatePOIDto = {
        name: "Updated POI Name",
      };

      const updatedPOI = { ...mockPOI, ...updateDto };
      mockPoiService.update.mockResolvedValue(updatedPOI);

      const result = await controller.update(1, updateDto);

      expect(poiService.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedPOI);
    });
  });

  describe("remove", () => {
    it("should remove a POI", async () => {
      mockPoiService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(poiService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: "POI supprimé avec succès" });
    });
  });
});
