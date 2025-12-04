import { Test, TestingModule } from '@nestjs/testing';
import { GpxParserService } from './gpx-parser.service';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

describe('GpxParserService', () => {
  let service: GpxParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GpxParserService],
    }).compile();

    service = module.get<GpxParserService>(GpxParserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseGPXFile', () => {
    const createTestGPXFile = (content: string, filename = 'test.gpx'): string => {
      const testDir = path.join(__dirname, '../../../test-files');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      const filePath = path.join(testDir, filename);
      fs.writeFileSync(filePath, content, 'utf-8');
      return filePath;
    };

    const deleteTestFile = (filePath: string) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    };

    it('should parse a valid GPX file with track points', async () => {
      const gpxContent = `<?xml version="1.0"?>
<gpx version="1.1" creator="Test">
  <trk>
    <name>Test Track</name>
    <trkseg>
      <trkpt lat="49.3394" lon="-0.8566">
        <ele>50</ele>
        <time>2025-12-01T10:00:00Z</time>
      </trkpt>
      <trkpt lat="49.3500" lon="-0.8600">
        <ele>75</ele>
        <time>2025-12-01T10:15:00Z</time>
      </trkpt>
      <trkpt lat="49.3714" lon="-0.8494">
        <ele>60</ele>
        <time>2025-12-01T10:30:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

      const filePath = createTestGPXFile(gpxContent, 'valid-track.gpx');

      try {
        const result = await service.parseGPXFile(filePath);

        expect(result).toHaveProperty('startPoint');
        expect(result).toHaveProperty('endPoint');
        expect(result).toHaveProperty('waypoints');
        expect(result).toHaveProperty('totalDistance');
        expect(result).toHaveProperty('elevationGain');

        expect(result.startPoint).toEqual({ lat: 49.3394, lon: -0.8566 });
        expect(result.endPoint).toEqual({ lat: 49.3714, lon: -0.8494 });
        expect(result.waypoints).toHaveLength(3);
        expect(result.totalDistance).toBeGreaterThan(0);
      } finally {
        deleteTestFile(filePath);
      }
    });

    it('should parse a valid GPX file with waypoints', async () => {
      const gpxContent = `<?xml version="1.0"?>
<gpx version="1.1" creator="Test">
  <wpt lat="49.3394" lon="-0.8566">
    <name>Start Point</name>
    <ele>50</ele>
  </wpt>
  <wpt lat="49.3714" lon="-0.8494">
    <name>End Point</name>
    <ele>75</ele>
  </wpt>
</gpx>`;

      const filePath = createTestGPXFile(gpxContent, 'valid-waypoints.gpx');

      try {
        const result = await service.parseGPXFile(filePath);

        expect(result.waypoints).toHaveLength(2);
        expect(result.waypoints[0].name).toBe('Start Point');
        expect(result.waypoints[1].name).toBe('End Point');
      } finally {
        deleteTestFile(filePath);
      }
    });

    it('should parse a valid GPX file with routes', async () => {
      const gpxContent = `<?xml version="1.0"?>
<gpx version="1.1" creator="Test">
  <rte>
    <name>Test Route</name>
    <rtept lat="49.3394" lon="-0.8566">
      <name>Point 1</name>
    </rtept>
    <rtept lat="49.3500" lon="-0.8600">
      <name>Point 2</name>
    </rtept>
  </rte>
</gpx>`;

      const filePath = createTestGPXFile(gpxContent, 'valid-route.gpx');

      try {
        const result = await service.parseGPXFile(filePath);

        expect(result.waypoints).toHaveLength(2);
        expect(result.waypoints[0].name).toBe('Point 1');
      } finally {
        deleteTestFile(filePath);
      }
    });

    it('should throw BadRequestException for invalid GPX file', async () => {
      const invalidContent = 'This is not a valid GPX file';
      const filePath = createTestGPXFile(invalidContent, 'invalid.gpx');

      try {
        await expect(service.parseGPXFile(filePath)).rejects.toThrow(
          BadRequestException,
        );
      } finally {
        deleteTestFile(filePath);
      }
    });

    it('should throw BadRequestException for GPX with no waypoints', async () => {
      const gpxContent = `<?xml version="1.0"?>
<gpx version="1.1" creator="Test">
  <metadata>
    <name>Empty GPX</name>
  </metadata>
</gpx>`;

      const filePath = createTestGPXFile(gpxContent, 'empty.gpx');

      try {
        await expect(service.parseGPXFile(filePath)).rejects.toThrow(
          'No waypoints or track points found in GPX file',
        );
      } finally {
        deleteTestFile(filePath);
      }
    });

    it('should calculate elevation gain correctly', async () => {
      const gpxContent = `<?xml version="1.0"?>
<gpx version="1.1" creator="Test">
  <trk>
    <trkseg>
      <trkpt lat="49.3394" lon="-0.8566">
        <ele>100</ele>
      </trkpt>
      <trkpt lat="49.3500" lon="-0.8600">
        <ele>150</ele>
      </trkpt>
      <trkpt lat="49.3600" lon="-0.8700">
        <ele>120</ele>
      </trkpt>
      <trkpt lat="49.3714" lon="-0.8494">
        <ele>180</ele>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

      const filePath = createTestGPXFile(gpxContent, 'elevation.gpx');

      try {
        const result = await service.parseGPXFile(filePath);

        // Elevation gain: (150-100) + (180-120) = 50 + 60 = 110
        expect(result.elevationGain).toBe(110);
      } finally {
        deleteTestFile(filePath);
      }
    });
  });

  describe('toGeoJSON', () => {
    it('should convert waypoints to GeoJSON LineString', () => {
      const waypoints = [
        { lat: 49.3394, lon: -0.8566 },
        { lat: 49.3500, lon: -0.8600 },
        { lat: 49.3714, lon: -0.8494 },
      ];

      const geoJson = service.toGeoJSON(waypoints);
      const parsed = JSON.parse(geoJson);

      expect(parsed.type).toBe('LineString');
      expect(parsed.coordinates).toHaveLength(3);
      expect(parsed.coordinates[0]).toEqual([-0.8566, 49.3394]);
    });
  });

  describe('deleteFile', () => {
    it('should delete existing file', () => {
      const testDir = path.join(__dirname, '../../../test-files');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      const filePath = path.join(testDir, 'delete-test.txt');
      fs.writeFileSync(filePath, 'test content');

      expect(fs.existsSync(filePath)).toBe(true);
      service.deleteFile(filePath);
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('should not throw error for non-existent file', () => {
      expect(() => {
        service.deleteFile('/path/to/nonexistent/file.gpx');
      }).not.toThrow();
    });
  });
});
