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
   * Get multer configuration for image uploads (parcours, POI, treasure)
   */
  getImageMulterConfig(subfolder: 'parcours' | 'poi' | 'treasure' | 'rewards') {
    return {
      storage: diskStorage({
        destination: `./uploads/images/${subfolder}`,
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Only accept common image formats
        if (
          !file.originalname.match(
            /\.(jpg|jpeg|png|gif|webp|JPG|JPEG|PNG|GIF|WEBP)$/,
          )
        ) {
          return callback(
            new Error(
              'Only image files are allowed (jpg, jpeg, png, gif, webp)',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size for images
      },
    };
  }

  /**
   * Get multer configuration for audio uploads (podcasts)
   */
  getAudioMulterConfig() {
    return {
      storage: diskStorage({
        destination: './uploads/audio',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Only accept common audio formats
        if (!file.originalname.match(/\.(mp3|wav|ogg|m4a|MP3|WAV|OGG|M4A)$/)) {
          return callback(
            new Error('Only audio files are allowed (mp3, wav, ogg, m4a)'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size for audio
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

  /**
   * Generate public URL for uploaded image
   */
  getImageUrl(
    filename: string,
    subfolder: 'parcours' | 'poi' | 'treasure' | 'rewards',
    baseUrl: string,
  ): string {
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/uploads/images/${subfolder}/${filename}`;
  }

  /**
   * Generate public URL for uploaded audio file
   */
  getAudioUrl(filename: string, baseUrl: string): string {
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/uploads/audio/${filename}`;
  }
}
