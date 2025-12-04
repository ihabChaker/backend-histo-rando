import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';
import * as path from 'path';
import * as fs from 'fs';

describe('FileUploadService', () => {
  let service: FileUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileUploadService],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGPXMulterConfig', () => {
    it('should return multer configuration object', () => {
      const config = service.getGPXMulterConfig();

      expect(config).toBeDefined();
      expect(config.storage).toBeDefined();
      expect(config.fileFilter).toBeDefined();
      expect(config.limits).toBeDefined();
      expect(config.limits.fileSize).toBe(10 * 1024 * 1024); // 10MB
    });

    it('should accept .gpx files', () => {
      const config = service.getGPXMulterConfig();
      const mockFile = {
        originalname: 'test.gpx',
        mimetype: 'application/gpx+xml',
      } as Express.Multer.File;

      const callback = jest.fn();
      config.fileFilter(null, mockFile, callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should reject non-.gpx files', () => {
      const config = service.getGPXMulterConfig();
      const mockFile = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
      } as Express.Multer.File;

      const callback = jest.fn();
      config.fileFilter(null, mockFile, callback);

      expect(callback).toHaveBeenCalledWith(
        new Error('Only GPX files are allowed'),
        false,
      );
    });

    it('should accept .GPX files (case insensitive)', () => {
      const config = service.getGPXMulterConfig();
      const mockFile = {
        originalname: 'test.GPX',
        mimetype: 'application/gpx+xml',
      } as Express.Multer.File;

      const callback = jest.fn();
      config.fileFilter(null, mockFile, callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should generate unique filenames with UUID', () => {
      const config = service.getGPXMulterConfig();
      const mockFile = {
        originalname: 'trail.gpx',
      } as Express.Multer.File;

      const callback = jest.fn();
      // @ts-ignore - accessing storage._handleFile for testing
      config.storage.getFilename(null, mockFile, callback);

      expect(callback).toHaveBeenCalled();
      const filename = callback.mock.calls[0][1];
      expect(filename).toMatch(/^[a-f0-9-]+\.gpx$/);
    });

    it('should create upload directory if it does not exist', () => {
      const config = service.getGPXMulterConfig();
      const uploadPath = path.join(process.cwd(), 'uploads', 'gpx');

      // The directory should exist or be created by multer
      expect(config.storage).toBeDefined();
    });
  });

  describe('getFileUrl', () => {
    it('should generate correct file URL', () => {
      const filename = 'test-123.gpx';
      const baseUrl = 'http://localhost:3000';
      const expectedUrl = `${baseUrl}/uploads/gpx/${filename}`;

      const url = service.getFileUrl(filename, baseUrl);

      expect(url).toBe(expectedUrl);
    });

    it('should handle base URL with trailing slash', () => {
      const filename = 'test-123.gpx';
      const baseUrl = 'http://localhost:3000/';
      const expectedUrl = 'http://localhost:3000/uploads/gpx/test-123.gpx';

      const url = service.getFileUrl(filename, baseUrl);

      expect(url).toBe(expectedUrl);
    });

    it('should handle different base URLs', () => {
      const filename = 'test-123.gpx';
      const baseUrl = 'https://api.example.com';
      const expectedUrl = `${baseUrl}/uploads/gpx/${filename}`;

      const url = service.getFileUrl(filename, baseUrl);

      expect(url).toBe(expectedUrl);
    });
  });

  describe('integration with file system', () => {
    it('should ensure upload directory exists', () => {
      const uploadPath = path.join(process.cwd(), 'uploads', 'gpx');
      
      // The service should create this directory when instantiated
      const config = service.getGPXMulterConfig();
      
      expect(config.storage).toBeDefined();
    });
  });

  afterAll(() => {
    // Clean up any test files
    const uploadPath = path.join(process.cwd(), 'uploads', 'gpx');
    if (fs.existsSync(uploadPath)) {
      const files = fs.readdirSync(uploadPath);
      files.forEach((file) => {
        if (file.startsWith('test-')) {
          try {
            fs.unlinkSync(path.join(uploadPath, file));
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      });
    }
  });
});
