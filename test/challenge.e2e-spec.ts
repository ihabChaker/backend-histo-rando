import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from '../src/app.module';
import {
  syncDatabase,
  cleanDatabase,
  setSequelizeInstance,
} from './helpers/database.helper';
import { createRegisterData, createParcoursData } from './factories';

describe('Challenge E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let parcoursId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();

    const sequelize = app.get(Sequelize);
    setSequelizeInstance(sequelize);
    await syncDatabase(true);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase();

    const registerData = createRegisterData();
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(registerData);
    authToken = registerResponse.body.access_token;

    const parcoursData = createParcoursData();
    const parcoursResponse = await request(app.getHttpServer())
      .post('/api/v1/parcours')
      .set('Authorization', `Bearer ${authToken}`)
      .send(parcoursData);
    parcoursId = parcoursResponse.body.id;
  });

  describe('POST /challenges', () => {
    it('should create a new challenge', () => {
      return request(app.getHttpServer())
        .post('/api/v1/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Weighted Backpack Challenge',
          description: 'Complete the parcours with a 10kg backpack',
          challengeType: 'weighted_backpack',
          pointsReward: 100,
          difficultyMultiplier: 1.5,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Weighted Backpack Challenge');
          expect(res.body.challengeType).toBe('weighted_backpack');
        });
    });

    it('should fail with invalid challenge type', () => {
      return request(app.getHttpServer())
        .post('/api/v1/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Challenge',
          challengeType: 'invalid_type',
          pointsReward: 50,
        })
        .expect(400);
    });
  });

  describe('GET /challenges', () => {
    it('should list all challenges (public)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Challenge 1',
          challengeType: 'distance',
          pointsReward: 50,
        });

      await request(app.getHttpServer())
        .post('/api/v1/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Challenge 2',
          challengeType: 'time',
          pointsReward: 75,
        });

      return request(app.getHttpServer())
        .get('/api/v1/challenges')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
        });
    });
  });

  describe('POST /challenges/start', () => {
    it('should start a challenge', async () => {
      const challengeRes = await request(app.getHttpServer())
        .post('/api/v1/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Challenge',
          challengeType: 'period_clothing',
          pointsReward: 80,
        });

      const activityRes = await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'walking',
        });

      return request(app.getHttpServer())
        .post('/api/v1/challenges/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          challengeId: challengeRes.body.id,
          activityId: activityRes.body.id,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.challengeId).toBe(challengeRes.body.id);
          expect(res.body.activityId).toBe(activityRes.body.id);
          expect(res.body.status).toBe('started');
        });
    });
  });

  describe('PUT /challenges/progress/:id', () => {
    it('should complete a challenge', async () => {
      const challengeRes = await request(app.getHttpServer())
        .post('/api/v1/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Challenge',
          challengeType: 'distance',
          pointsReward: 100,
        });

      const activityRes = await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'walking',
        });

      const progressRes = await request(app.getHttpServer())
        .post('/api/v1/challenges/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          challengeId: challengeRes.body.id,
          activityId: activityRes.body.id,
        });

      return request(app.getHttpServer())
        .put(`/api/v1/challenges/progress/${progressRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed',
          pointsEarned: 100,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('completed');
          expect(res.body.pointsEarned).toBe(100);
        });
    });

    it('should mark challenge as failed', async () => {
      const challengeRes = await request(app.getHttpServer())
        .post('/api/v1/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Challenge',
          challengeType: 'time',
          pointsReward: 50,
        });

      const activityRes = await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'running',
        });

      const progressRes = await request(app.getHttpServer())
        .post('/api/v1/challenges/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          challengeId: challengeRes.body.id,
          activityId: activityRes.body.id,
        });

      return request(app.getHttpServer())
        .put(`/api/v1/challenges/progress/${progressRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'failed',
          pointsEarned: 0,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('failed');
          expect(res.body.pointsEarned).toBe(0);
        });
    });
  });

  describe('GET /challenges/progress/me', () => {
    it('should list user challenge progress', async () => {
      const challengeRes = await request(app.getHttpServer())
        .post('/api/v1/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Challenge',
          challengeType: 'distance',
          pointsReward: 100,
        });

      const activityRes = await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'walking',
        });

      await request(app.getHttpServer())
        .post('/api/v1/challenges/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          challengeId: challengeRes.body.id,
          activityId: activityRes.body.id,
        });

      return request(app.getHttpServer())
        .get('/api/v1/challenges/progress/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);
        });
    });
  });

  describe('DELETE /challenges/:id', () => {
    it('should delete a challenge', async () => {
      const challengeRes = await request(app.getHttpServer())
        .post('/api/v1/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'To Delete',
          challengeType: 'distance',
          pointsReward: 50,
        });

      return request(app.getHttpServer())
        .delete(`/api/v1/challenges/${challengeRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
