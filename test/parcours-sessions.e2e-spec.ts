import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Parcours Sessions (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;
  let parcoursId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    // Register test user
    const timestamp = Date.now();
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `sessiontest${timestamp}@example.com`,
        username: `sessiontest${timestamp}`,
        password: 'password123',
        firstName: 'Session',
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
        name: 'Session Test Parcours',
        description: 'Test parcours for sessions',
        difficultyLevel: 'easy',
        distanceKm: 5.0,
        estimatedDuration: 60,
        isPmrAccessible: true,
        isActive: true,
        historicalTheme: 'Test',
        startingPointLat: 49.1594,
        startingPointLon: 5.3878,
        endingPointLat: 49.17,
        endingPointLon: 5.39,
      })
      .expect(201);

    parcoursId = parcoursResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/parcours-sessions/start (POST)', () => {
    it('should start a new session', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/parcours-sessions/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId,
          startLat: 49.1594,
          startLon: 5.3878,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('parcoursId');
      expect(response.body).toHaveProperty('startTime');
      expect(response.body.isCompleted).toBe(false);
      expect(response.body.distanceCovered).toBe(0);
    });

    it('should resume existing session instead of creating new one', async () => {
      // Start first session
      const firstResponse = await request(app.getHttpServer())
        .post('/api/v1/parcours-sessions/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId,
          startLat: 49.1594,
          startLon: 5.3878,
        });

      const firstSessionId = firstResponse.body.id;

      // Try to start again - should get same session
      const secondResponse = await request(app.getHttpServer())
        .post('/api/v1/parcours-sessions/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId,
          startLat: 49.1594,
          startLon: 5.3878,
        })
        .expect(201);

      expect(secondResponse.body.id).toBe(firstSessionId);
    });
  });

  describe('/api/v1/parcours-sessions/active (GET)', () => {
    it('should get all active sessions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/parcours-sessions/active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/api/v1/parcours-sessions/:id/update (PUT)', () => {
    it('should update session GPS position', async () => {
      // Start a session
      const sessionResponse = await request(app.getHttpServer())
        .post('/api/v1/parcours-sessions/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId,
          startLat: 49.1594,
          startLon: 5.3878,
        });

      const sessionId = sessionResponse.body.id;

      // Update position
      const response = await request(app.getHttpServer())
        .put(`/api/v1/parcours-sessions/${sessionId}/update`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentLat: 49.1601,
          currentLon: 5.3912,
          distanceCovered: 150.5,
        })
        .expect(200);

      expect(response.body.currentLatitude).toBe(49.1601);
      expect(response.body.currentLongitude).toBe(5.3912);
      expect(response.body.distanceCovered).toBe(150.5);
    });
  });

  describe('/api/v1/parcours-sessions/:id/complete (POST)', () => {
    it('should complete session and award bonus', async () => {
      // Start a session
      const sessionResponse = await request(app.getHttpServer())
        .post('/api/v1/parcours-sessions/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId,
          startLat: 49.1594,
          startLon: 5.3878,
        });

      const sessionId = sessionResponse.body.id;

      // Complete session
      const response = await request(app.getHttpServer())
        .post(`/api/v1/parcours-sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          finalLat: 49.17,
          finalLon: 5.39,
          distanceCovered: 2500.0,
        })
        .expect(201);

      expect(response.body.session.isCompleted).toBe(true);
      expect(response.body.pointsEarned).toBe(50); // Default completion bonus
      expect(response.body).toHaveProperty('message');
    });

    it('should not allow completing already completed session', async () => {
      const parcoursResponse = await request(app.getHttpServer())
        .get('/api/v1/parcours')
        .set('Authorization', `Bearer ${authToken}`);

      const firstParcours = parcoursResponse.body.data[0];

      const sessionResponse = await request(app.getHttpServer())
        .post('/api/v1/parcours-sessions/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: firstParcours.id,
          startLat: 49.1594,
          startLon: 5.3878,
        });

      const sessionId = sessionResponse.body.id;

      // Complete once
      await request(app.getHttpServer())
        .post(`/api/v1/parcours-sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          finalLat: 49.1623,
          finalLon: 5.4012,
          distanceCovered: 2500.0,
        });

      // Try to complete again
      await request(app.getHttpServer())
        .post(`/api/v1/parcours-sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          finalLat: 49.1623,
          finalLon: 5.4012,
          distanceCovered: 2500.0,
        })
        .expect(400);
    });
  });

  describe('/api/v1/parcours-sessions/:id (DELETE)', () => {
    it('should delete/abandon a session', async () => {
      const parcoursResponse = await request(app.getHttpServer())
        .get('/api/v1/parcours')
        .set('Authorization', `Bearer ${authToken}`);

      const firstParcours = parcoursResponse.body.data[0];

      const sessionResponse = await request(app.getHttpServer())
        .post('/api/v1/parcours-sessions/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: firstParcours.id,
          startLat: 49.1594,
          startLon: 5.3878,
        });

      const sessionId = sessionResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/api/v1/parcours-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
