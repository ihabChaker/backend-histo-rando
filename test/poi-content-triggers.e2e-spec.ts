import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/sequelize';
import { Quiz } from '../src/modules/quiz/entities/quiz.entity';
import { Podcast } from '../src/modules/media/entities/podcast.entity';

describe('POI Content Triggers (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;
  let parcoursId: number;
  let poiId: number;
  let poiQrCode: string;
  let quizId: number;
  let podcastId: number;
  let quizModel: typeof Quiz;
  let podcastModel: typeof Podcast;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    // Get Sequelize models
    quizModel = moduleFixture.get(getModelToken(Quiz));
    podcastModel = moduleFixture.get(getModelToken(Podcast));

    // Register test user
    const timestamp = Date.now();
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `poitest${timestamp}@example.com`,
        username: `poitest${timestamp}`,
        password: 'password123',
        firstName: 'POI',
        lastName: 'Test',
        isPmr: false,
      })
      .expect(201);

    authToken = registerResponse.body.access_token;
    userId = registerResponse.body.user.id;

    // Create a parcours
    const parcoursResponse = await request(app.getHttpServer())
      .post('/api/v1/parcours')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'POI Content Test Parcours',
        description: 'Test parcours for POI content triggers',
        difficultyLevel: 'easy',
        distanceKm: 5.0,
        estimatedDuration: 60,
        isPmrAccessible: true,
        isActive: true,
        historicalTheme: 'Test',
        startingPointLat: 49.1594,
        startingPointLon: 5.3878,
      })
      .expect(201);

    parcoursId = parcoursResponse.body.id;

    // Create a quiz
    const quizResponse = await request(app.getHttpServer())
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Quiz for POI',
        description: 'Quiz triggered by POI scan',
        difficulty: 'easy',
        totalPoints: 20,
      })
      .expect(201);

    quizId = quizResponse.body.id;

    // Create a podcast directly in DB (no API endpoint yet)
    const podcast = await podcastModel.create({
      title: 'Test Podcast for POI',
      description: 'Podcast triggered by POI scan',
      audioFileUrl: 'https://example.com/test-podcast.mp3',
      durationSeconds: 300,
      language: 'fr',
    });

    podcastId = podcast.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POI with Quiz Content', () => {
    it('should return quiz when POI with quizId is scanned', async () => {
      // Create POI with quiz
      const poiResponse = await request(app.getHttpServer())
        .post('/api/v1/poi')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId,
          name: 'POI with Quiz',
          description: 'This POI triggers a quiz',
          poiType: 'monument',
          latitude: 49.305,
          longitude: -0.855,
          orderInParcours: 1,
          quizId, // Link to quiz
        })
        .expect(201);

      poiId = poiResponse.body.id;
      poiQrCode = poiResponse.body.qrCode;

      // Scan the POI QR code
      const scanResponse = await request(app.getHttpServer())
        .post('/api/v1/poi/scan-qr')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          qrCode: poiQrCode,
        })
        .expect(201);

      expect(scanResponse.body).toHaveProperty('poi');
      expect(scanResponse.body).toHaveProperty('quiz');
      expect(scanResponse.body).toHaveProperty('isNewVisit');
      expect(scanResponse.body.isNewVisit).toBe(true);
      expect(scanResponse.body.quiz).toBeDefined();
      expect(scanResponse.body.quiz.id).toBe(quizId);
      expect(scanResponse.body.quiz.title).toBe('Test Quiz for POI');
    });
  });

  describe('POI with Podcast Content', () => {
    it('should return podcast when POI with podcastId is scanned', async () => {
      // Create POI with podcast
      const poiResponse = await request(app.getHttpServer())
        .post('/api/v1/poi')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId,
          name: 'POI with Podcast',
          description: 'This POI triggers a podcast',
          poiType: 'museum',
          latitude: 49.306,
          longitude: -0.856,
          orderInParcours: 2,
          podcastId, // Link to podcast
        })
        .expect(201);

      const podcastPoiQrCode = poiResponse.body.qrCode;

      // Scan the POI QR code
      const scanResponse = await request(app.getHttpServer())
        .post('/api/v1/poi/scan-qr')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          qrCode: podcastPoiQrCode,
        })
        .expect(201);

      expect(scanResponse.body).toHaveProperty('poi');
      expect(scanResponse.body).toHaveProperty('podcast');
      expect(scanResponse.body.podcast).toBeDefined();
      expect(scanResponse.body.podcast.id).toBe(podcastId);
      expect(scanResponse.body.podcast.title).toBe('Test Podcast for POI');
    });
  });

  describe('POI with Both Quiz and Podcast', () => {
    it('should return both quiz and podcast when POI has both', async () => {
      // Create POI with both quiz and podcast
      const poiResponse = await request(app.getHttpServer())
        .post('/api/v1/poi')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId,
          name: 'POI with Quiz and Podcast',
          description: 'This POI triggers both quiz and podcast',
          poiType: 'memorial',
          latitude: 49.307,
          longitude: -0.857,
          orderInParcours: 3,
          quizId,
          podcastId,
        })
        .expect(201);

      const bothContentQrCode = poiResponse.body.qrCode;

      // Scan the POI QR code
      const scanResponse = await request(app.getHttpServer())
        .post('/api/v1/poi/scan-qr')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          qrCode: bothContentQrCode,
        })
        .expect(201);

      expect(scanResponse.body).toHaveProperty('poi');
      expect(scanResponse.body).toHaveProperty('quiz');
      expect(scanResponse.body).toHaveProperty('podcast');
      expect(scanResponse.body.quiz).toBeDefined();
      expect(scanResponse.body.quiz.id).toBe(quizId);
      expect(scanResponse.body.podcast).toBeDefined();
      expect(scanResponse.body.podcast.id).toBe(podcastId);
    });
  });

  describe('POI with Session Linking', () => {
    it('should link POI visit to active session', async () => {
      // Start a parcours session
      const sessionResponse = await request(app.getHttpServer())
        .post('/api/v1/parcours-sessions/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId,
          startLat: 49.1594,
          startLon: 5.3878,
        })
        .expect(201);

      const sessionId = sessionResponse.body.id;

      // Create a simple POI
      const poiResponse = await request(app.getHttpServer())
        .post('/api/v1/poi')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId,
          name: 'Session Linked POI',
          description: 'POI to test session linking',
          poiType: 'beach',
          latitude: 49.308,
          longitude: -0.858,
          orderInParcours: 4,
        })
        .expect(201);

      const sessionPoiQrCode = poiResponse.body.qrCode;

      // Scan the POI with sessionId
      const scanResponse = await request(app.getHttpServer())
        .post('/api/v1/poi/scan-qr')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          qrCode: sessionPoiQrCode,
          sessionId, // Link to active session
        })
        .expect(201);

      expect(scanResponse.body.isNewVisit).toBe(true);

      // Verify session was updated with POI visit
      const updatedSessionResponse = await request(app.getHttpServer())
        .get('/api/v1/parcours-sessions/active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Session should have this POI in visited list
      const sessions = Array.isArray(updatedSessionResponse.body)
        ? updatedSessionResponse.body
        : [updatedSessionResponse.body];
      const activeSession = sessions.find((s) => s.id === sessionId);
      expect(activeSession).toBeDefined();
      const poisVisited = activeSession.getPoisVisited
        ? activeSession.getPoisVisited()
        : JSON.parse(activeSession.poisVisitedIds || '[]');
      expect(poisVisited).toContain(poiResponse.body.id);
    });
  });
});
