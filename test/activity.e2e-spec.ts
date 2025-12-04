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
import {
  createRegisterData,
  createParcoursData,
  createPOIData,
} from './factories';

describe('Activity E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let parcoursId: number;
  let poiId: number;

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

    // Register user
    const registerData = createRegisterData();
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(registerData);
    authToken = registerResponse.body.access_token;

    // Create parcours
    const parcoursData = createParcoursData();
    const parcoursResponse = await request(app.getHttpServer())
      .post('/api/v1/parcours')
      .set('Authorization', `Bearer ${authToken}`)
      .send(parcoursData);
    parcoursId = parcoursResponse.body.id;

    // Create POI
    const poiData = createPOIData(parcoursId);
    const poiResponse = await request(app.getHttpServer())
      .post('/api/v1/poi')
      .set('Authorization', `Bearer ${authToken}`)
      .send(poiData);
    poiId = poiResponse.body.id;
  });
  describe('POST /activities', () => {
    it('should start a new activity', () => {
      return request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'walking',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.parcoursId).toBe(parcoursId);
          expect(res.body.activityType).toBe('walking');
          expect(res.body.status).toBe('in_progress');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/v1/activities')
        .send({
          parcoursId: parcoursId,
          activityType: 'walking',
        })
        .expect(401);
    });

    it('should fail with invalid activity type', () => {
      return request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'invalid',
        })
        .expect(400);
    });
  });

  describe('PUT /activities/:id', () => {
    it('should complete activity and update user stats', async () => {
      const activityRes = await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'running',
        });

      const activityId = activityRes.body.id;

      return request(app.getHttpServer())
        .put(`/api/v1/activities/${activityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed',
          distanceCoveredKm: 5.2,
          pointsEarned: 100,
          averageSpeed: 10.5,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('completed');
          expect(res.body.distanceCoveredKm).toBe(5.2);
          expect(res.body.pointsEarned).toBe(100);
        });
    });

    it('should update activity with GPX trace', async () => {
      const activityRes = await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'cycling',
        });

      return request(app.getHttpServer())
        .put(`/api/v1/activities/${activityRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          gpxTraceUrl: 'https://example.com/traces/ride1.gpx',
        })
        .expect(200);
    });
  });

  describe('GET /activities', () => {
    it('should list user activities', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'walking',
        });

      await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'running',
        });

      return request(app.getHttpServer())
        .get('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThanOrEqual(2);
        });
    });
  });

  describe('GET /activities/stats', () => {
    it('should return user activity statistics', async () => {
      const activity1 = await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'walking',
        });

      await request(app.getHttpServer())
        .put(`/api/v1/activities/${activity1.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed',
          distanceCoveredKm: 3.5,
          pointsEarned: 50,
        });

      return request(app.getHttpServer())
        .get('/api/v1/activities/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalActivities');
          expect(res.body).toHaveProperty('completedActivities');
          expect(res.body).toHaveProperty('totalDistance');
          expect(res.body).toHaveProperty('totalPoints');
        });
    });
  });

  describe('POST /activities/poi-visits', () => {
    it('should record POI visit', async () => {
      const activityRes = await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'walking',
        });

      const response = await request(app.getHttpServer())
        .post('/api/v1/activities/poi-visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          poiId: poiId,
          activityId: activityRes.body.id,
          scannedQr: true,
          listenedAudio: false,
          pointsEarned: 10,
        });

      expect(response.status).toBe(201);
      expect(response.body.poiId).toBe(poiId);
      expect(response.body.activityId).toBe(activityRes.body.id);
      expect(response.body.scannedQr).toBe(true);
    });

    it('should prevent duplicate POI visits', async () => {
      const activityRes = await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'walking',
        });

      await request(app.getHttpServer())
        .post('/api/v1/activities/poi-visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          poiId: poiId,
          activityId: activityRes.body.id,
          scannedQr: true,
          pointsEarned: 10,
        });

      return request(app.getHttpServer())
        .post('/api/v1/activities/poi-visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          poiId: poiId,
          activityId: activityRes.body.id,
          scannedQr: true,
          pointsEarned: 10,
        })
        .expect(409);
    });
  });

  describe('GET /activities/poi-visits/me', () => {
    it('should list user POI visits', async () => {
      const activityRes = await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'walking',
        });

      await request(app.getHttpServer())
        .post('/api/v1/activities/poi-visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          poiId: poiId,
          activityId: activityRes.body.id,
          scannedQr: true,
          pointsEarned: 10,
        });

      return request(app.getHttpServer())
        .get('/api/v1/activities/poi-visits/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        });
    });
  });

  describe('DELETE /activities/:id', () => {
    it('should delete an activity', async () => {
      const activityRes = await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'walking',
        });

      return request(app.getHttpServer())
        .delete(`/api/v1/activities/${activityRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
