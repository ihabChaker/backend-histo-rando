import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadModule } from './file-upload.module';
import { FileUploadService } from './file-upload.service';
import { GpxParserService } from './gpx-parser.service';

describe('FileUploadModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [FileUploadModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide FileUploadService', () => {
    const service = module.get<FileUploadService>(FileUploadService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(FileUploadService);
  });

  it('should provide GpxParserService', () => {
    const service = module.get<GpxParserService>(GpxParserService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(GpxParserService);
  });

  it('should export FileUploadService', () => {
    const exportedServices = Reflect.getMetadata(
      'exports',
      FileUploadModule,
    );
    expect(exportedServices).toContain(FileUploadService);
  });

  it('should export GpxParserService', () => {
    const exportedServices = Reflect.getMetadata(
      'exports',
      FileUploadModule,
    );
    expect(exportedServices).toContain(GpxParserService);
  });
});
