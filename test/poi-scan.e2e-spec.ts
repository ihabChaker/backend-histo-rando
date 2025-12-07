import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('POI QR Scanning (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;
  let parcoursId: number;
  let poiId: number;
  let poiQrCode: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    // Register and login a test user
    const timestamp = Date.now();
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `testuser${timestamp}@example.com`,
        username: `testuser${timestamp}`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        isPmr: false,
      })
      .expect(201);

    expect(registerResponse.body).toHaveProperty('access_token');
    authToken = registerResponse.body.access_token;
    userId = registerResponse.body.user.id;

    // Create a test parcours
    const parcoursResponse = await request(app.getHttpServer())
      .post('/api/v1/parcours')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Parcours for POI Scan',
        description: 'E2E Test Parcours',
        difficultyLevel: 'easy',
        distanceKm: 5.0,
        estimatedDuration: 60,
        isPmrAccessible: true,
        isActive: true,
        historicalTheme: 'Test Theme',
        startingPointLat: 49.3,
        startingPointLon: -0.85,
        endingPointLat: 49.31,
        endingPointLon: -0.86,
      })
      .expect(201);

    parcoursId = parcoursResponse.body.id;

    // Create a test POI
    const poiResponse = await request(app.getHttpServer())
      .post('/api/v1/poi')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        parcoursId,
        name: 'Test POI',
        description: 'Test POI for scanning',
        poiType: 'monument',
        latitude: 49.305,
        longitude: -0.855,
        orderInParcours: 1,
      })
      .expect(201);

    poiId = poiResponse.body.id;
    poiQrCode = poiResponse.body.qrCode;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/poi/scan-qr (POST)', () => {
    it('should scan a valid POI QR code', async () => {
      // Scan the QR code
      const response = await request(app.getHttpServer())
        .post('/api/v1/poi/scan-qr')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          qrCode: poiQrCode,
        })
        .expect(201);

      expect(response.body).toHaveProperty('poi');
      expect(response.body).toHaveProperty('isNewVisit');
      expect(response.body.poi.id).toBe(poiId);
      expect(response.body.isNewVisit).toBe(true);
    });

    it('should return quiz if POI has one', async () => {
      // Create a quiz
      const quizResponse = await request(app.getHttpServer())
        .post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Quiz',
          description: 'Test quiz description',
          difficulty: 'easy',
          pointsReward: 20,
          isActive: true,
        })
        .expect(201);

      const quizId = quizResponse.body.id;

      // Create a POI with quiz
      const poiWithQuizResponse = await request(app.getHttpServer())
        .post('/api/v1/poi')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId,
          name: 'POI with Quiz',
          description: 'Test POI with quiz',
          poiType: 'museum',
          latitude: 49.306,
          longitude: -0.856,
          orderInParcours: 2,
          quizId,
        })
        .expect(201);

      // Scan POI with quiz
      const scanResponse = await request(app.getHttpServer())
        .post('/api/v1/poi/scan-qr')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          qrCode: poiWithQuizResponse.body.qrCode,
        })
        .expect(201);

      expect(scanResponse.body).toHaveProperty('quiz');
      expect(scanResponse.body.quiz.id).toBe(quizId);
    });

    it('should return 404 for invalid QR code', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/poi/scan-qr')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          qrCode: 'invalid-qr-code-12345',
        })
        .expect(404);
    });

    it('should link visit to session if sessionId provided', async () => {
      // Start a session
      const sessionResponse = await request(app.getHttpServer())
        .post('/api/v1/parcours-sessions/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId,
          startLat: 49.3,
          startLon: -0.85,
        })
        .expect(201);

      const sessionId = sessionResponse.body.id;

      // Scan POI with session
      const response = await request(app.getHttpServer())
        .post('/api/v1/poi/scan-qr')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          qrCode: poiQrCode,
          sessionId: sessionId,
        })
        .expect(201);

      expect(response.body.isNewVisit).toBe(false); // Already scanned in first test
    });
  });
});
