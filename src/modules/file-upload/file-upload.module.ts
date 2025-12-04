import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { GpxParserService } from './gpx-parser.service';

@Module({
  providers: [FileUploadService, GpxParserService],
  exports: [FileUploadService, GpxParserService],
})
export class FileUploadModule {}
