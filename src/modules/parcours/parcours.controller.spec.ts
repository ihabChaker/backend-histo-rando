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
import { FileUploadService } from '../file-upload/file-upload.service';
import { GpxParserService } from '../file-upload/gpx-parser.service';
import { BadRequestException } from '@nestjs/common';

describe('ParcoursController', () => {
  let controller: ParcoursController;
  let parcoursService: ParcoursService;
  let fileUploadService: FileUploadService;
  let gpxParserService: GpxParserService;

  const mockParcoursService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findNearby: jest.fn(),
  };

  const mockFileUploadService = {
    getFileUrl: jest.fn(),
  };

  const mockGpxParserService = {
    parseGPXFile: jest.fn(),
    toGeoJSON: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParcoursController],
      providers: [
        {
          provide: ParcoursService,
          useValue: mockParcoursService,
        },
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
        {
          provide: GpxParserService,
          useValue: mockGpxParserService,
        },
      ],
    }).compile();

    controller = module.get<ParcoursController>(ParcoursController);
    parcoursService = module.get<ParcoursService>(ParcoursService);
    fileUploadService = module.get<FileUploadService>(FileUploadService);
    gpxParserService = module.get<GpxParserService>(GpxParserService);
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

  describe('uploadGPX', () => {
    const mockFile = {
      filename: 'test-123.gpx',
      path: '/uploads/gpx/test-123.gpx',
    } as Express.Multer.File;

    const mockParsedData = {
      startPoint: { lat: 49.3425, lon: -0.8874 },
      endPoint: { lat: 49.3625, lon: -0.8674 },
      totalDistance: 12.5,
      elevationGain: 250,
      waypoints: [
        { lat: 49.3425, lon: -0.8874, ele: 100 },
        { lat: 49.3430, lon: -0.8870, ele: 110 },
      ],
    };

    const mockGeoJson = JSON.stringify({
      type: 'LineString',
      coordinates: [
        [-0.8874, 49.3425],
        [-0.8870, 49.3430],
      ],
    });

    beforeEach(() => {
      process.env.API_BASE_URL = 'http://localhost:3000';
    });

    it('should upload and parse GPX file successfully', async () => {
      mockGpxParserService.parseGPXFile.mockResolvedValue(mockParsedData);
      mockGpxParserService.toGeoJSON.mockReturnValue(mockGeoJson);
      mockFileUploadService.getFileUrl.mockReturnValue('http://localhost:3000/uploads/gpx/test-123.gpx');

      const result = await controller.uploadGPX(mockFile);

      expect(gpxParserService.parseGPXFile).toHaveBeenCalledWith(mockFile.path);
      expect(gpxParserService.toGeoJSON).toHaveBeenCalledWith(mockParsedData.waypoints);
      expect(fileUploadService.getFileUrl).toHaveBeenCalledWith(
        mockFile.filename,
        'http://localhost:3000',
      );
      expect(result).toEqual({
        filename: mockFile.filename,
        gpxFileUrl: 'http://localhost:3000/uploads/gpx/test-123.gpx',
        startPoint: mockParsedData.startPoint,
        endPoint: mockParsedData.endPoint,
        totalDistance: mockParsedData.totalDistance,
        elevationGain: mockParsedData.elevationGain,
        waypointsCount: mockParsedData.waypoints.length,
        geoJson: mockGeoJson,
      });
    });

    it('should throw BadRequestException if no file is uploaded', async () => {
      await expect(controller.uploadGPX(null as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.uploadGPX(null as any)).rejects.toThrow(
        'No file uploaded',
      );
    });

    it('should delete file and throw error if parsing fails', async () => {
      const parseError = new Error('Invalid GPX format');
      
      mockGpxParserService.parseGPXFile.mockRejectedValue(parseError);
      mockGpxParserService.deleteFile.mockResolvedValue(undefined);

      await expect(controller.uploadGPX(mockFile)).rejects.toThrow(parseError);
      expect(gpxParserService.deleteFile).toHaveBeenCalledWith(mockFile.path);
    });

    it('should use API_BASE_URL from environment', async () => {
      process.env.API_BASE_URL = 'https://api.example.com';
      
      mockGpxParserService.parseGPXFile.mockResolvedValue(mockParsedData);
      mockGpxParserService.toGeoJSON.mockReturnValue(mockGeoJson);
      mockFileUploadService.getFileUrl.mockReturnValue('https://api.example.com/uploads/gpx/test-123.gpx');

      await controller.uploadGPX(mockFile);

      expect(fileUploadService.getFileUrl).toHaveBeenCalledWith(
        mockFile.filename,
        'https://api.example.com',
      );
    });
  });
});
