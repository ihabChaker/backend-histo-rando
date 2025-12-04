import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  /**
   * Get multer configuration for GPX file uploads
   */
  getGPXMulterConfig() {
    return {
      storage: diskStorage({
        destination: './uploads/gpx',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Only accept .gpx files
        if (!file.originalname.match(/\.(gpx|GPX)$/)) {
          return callback(new Error('Only GPX files are allowed'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    };
  }

  /**
   * Generate public URL for uploaded file
   */
  getFileUrl(filename: string, baseUrl: string): string {
    // Remove trailing slash from baseUrl if present
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/uploads/gpx/${filename}`;
  }
}
