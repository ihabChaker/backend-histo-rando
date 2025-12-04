import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '@/app.module';

describe('GPX Upload (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  const validGPX = `<?xml version="1.0"?>
<gpx version="1.1" creator="Test">
  <trk>
    <name>Test Track</name>
    <trkseg>
      <trkpt lat="49.3394" lon="-0.8566">
        <ele>50</ele>
      </trkpt>
      <trkpt lat="49.3500" lon="-0.8600">
        <ele>75</ele>
      </trkpt>
      <trkpt lat="49.3714" lon="-0.8494">
        <ele>60</ele>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        username: 'admin',
        password: 'password',
      });

    if (loginResponse.status === 200 || loginResponse.status === 201) {
      authToken = loginResponse.body.accessToken;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/parcours/upload-gpx (POST)', () => {
    it('should upload and parse a valid GPX file', async () => {
      const tempFile = path.join(__dirname, 'test-upload.gpx');
      fs.writeFileSync(tempFile, validGPX);

      try {
        const response = await request(app.getHttpServer())
          .post('/api/v1/parcours/upload-gpx')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', tempFile)
          .expect(201);

        expect(response.body).toHaveProperty('filename');
        expect(response.body).toHaveProperty('gpxFileUrl');
        expect(response.body).toHaveProperty('startPoint');
        expect(response.body).toHaveProperty('endPoint');
        expect(response.body).toHaveProperty('totalDistance');
        expect(response.body).toHaveProperty('elevationGain');
        expect(response.body).toHaveProperty('waypointsCount');
        expect(response.body).toHaveProperty('geoJson');

        expect(response.body.startPoint).toEqual({
          lat: 49.3394,
          lon: -0.8566,
        });
        expect(response.body.endPoint).toEqual({
          lat: 49.3714,
          lon: -0.8494,
        });
        expect(response.body.waypointsCount).toBe(3);
        expect(response.body.totalDistance).toBeGreaterThan(0);

        // Clean up uploaded file
        const uploadedFilePath = path.join(
          __dirname,
          '../../uploads/gpx',
          response.body.filename,
        );
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }
      } finally {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });

    it('should reject upload without file', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/parcours/upload-gpx')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject upload with invalid GPX content', async () => {
      const tempFile = path.join(__dirname, 'invalid.gpx');
      fs.writeFileSync(tempFile, 'This is not valid GPX content');

      try {
        await request(app.getHttpServer())
          .post('/api/v1/parcours/upload-gpx')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', tempFile)
          .expect(400);
      } finally {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });

    it('should reject upload without authentication', async () => {
      const tempFile = path.join(__dirname, 'test-noauth.gpx');
      fs.writeFileSync(tempFile, validGPX);

      try {
        await request(app.getHttpServer())
          .post('/api/v1/parcours/upload-gpx')
          .attach('file', tempFile)
          .expect(401);
      } finally {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });
  });

  describe('/api/v1/parcours (POST) with GPX', () => {
    it('should create parcours with GPX file URL', async () => {
      const tempFile = path.join(__dirname, 'parcours-create.gpx');
      fs.writeFileSync(tempFile, validGPX);

      try {
        // First upload GPX
        const uploadResponse = await request(app.getHttpServer())
          .post('/api/v1/parcours/upload-gpx')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', tempFile)
          .expect(201);

        const gpxFileUrl = uploadResponse.body.gpxFileUrl;

        // Then create parcours with the GPX data
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/parcours')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Test Parcours with GPX',
            description: 'Created from GPX file',
            difficultyLevel: 'medium',
            distanceKm: uploadResponse.body.totalDistance,
            estimatedDuration: 180,
            historicalTheme: 'WWII',
            startingPointLat: uploadResponse.body.startPoint.lat,
            startingPointLon: uploadResponse.body.startPoint.lon,
            gpxFileUrl: gpxFileUrl,
            isActive: true,
          })
          .expect(201);

        expect(createResponse.body).toHaveProperty('id');
        expect(createResponse.body.gpxFileUrl).toBe(gpxFileUrl);
        expect(createResponse.body.distanceKm).toBeCloseTo(
          uploadResponse.body.totalDistance,
          1,
        );

        // Clean up
        const parcoursId = createResponse.body.id;
        await request(app.getHttpServer())
          .delete(`/api/v1/parcours/${parcoursId}`)
          .set('Authorization', `Bearer ${authToken}`);

        // Clean up uploaded file
        const uploadedFilePath = path.join(
          __dirname,
          '../../uploads/gpx',
          uploadResponse.body.filename,
        );
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }
      } finally {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });
  });
});
