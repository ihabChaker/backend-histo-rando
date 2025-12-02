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

describe('Reward E2E Tests', () => {
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

    // Create parcours for activity-based point earning
    const parcoursData = createParcoursData();
    const parcoursResponse = await request(app.getHttpServer())
      .post('/api/v1/parcours')
      .set('Authorization', `Bearer ${authToken}`)
      .send(parcoursData);
    parcoursId = parcoursResponse.body.id;
  });

  describe('POST /rewards', () => {
    it('should create a new reward', () => {
      return request(app.getHttpServer())
        .post('/api/v1/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Free Museum Entry',
          description: 'Get free entry to local museum',
          pointsCost: 200,
          rewardType: 'discount',
          partnerName: 'Normandy Museum',
          stockQuantity: 50,
          imageUrl: 'https://example.com/rewards/museum.jpg',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Free Museum Entry');
          expect(res.body.pointsCost).toBe(200);
          expect(res.body.stockQuantity).toBe(50);
        });
    });

    it('should fail with invalid reward type', () => {
      return request(app.getHttpServer())
        .post('/api/v1/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Invalid Reward',
          pointsCost: 100,
          rewardType: 'invalid_type',
        })
        .expect(400);
    });
  });

  describe('GET /rewards', () => {
    it('should list all rewards (public)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Reward 1',
          pointsCost: 100,
          rewardType: 'gift',
          stockQuantity: 25,
        });

      await request(app.getHttpServer())
        .post('/api/v1/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Reward 2',
          pointsCost: 150,
          rewardType: 'badge',
          stockQuantity: 100,
        });

      return request(app.getHttpServer())
        .get('/api/v1/rewards')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
        });
    });
  });

  describe('POST /rewards/redeem', () => {
    it('should redeem a reward successfully', async () => {
      // Create reward
      const rewardRes = await request(app.getHttpServer())
        .post('/api/v1/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Reward',
          pointsCost: 50,
          rewardType: 'discount',
          stockQuantity: 10,
        });

      // Give user some points by completing an activity
      const activityRes = await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'walking',
        });

      await request(app.getHttpServer())
        .put(`/api/v1/activities/${activityRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed',
          pointsEarned: 100,
        });

      return request(app.getHttpServer())
        .post('/api/v1/rewards/redeem')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rewardId: rewardRes.body.id,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.rewardId).toBe(rewardRes.body.id);
          expect(res.body).toHaveProperty('redemptionCode');
          expect(res.body.redemptionCode).toMatch(/^RWD-/);
          expect(res.body.status).toBe('pending');
        });
    });

    it('should fail redemption with insufficient points', async () => {
      const rewardRes = await request(app.getHttpServer())
        .post('/api/v1/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Expensive Reward',
          pointsCost: 500,
          rewardType: 'premium_content',
          stockQuantity: 5,
        });

      return request(app.getHttpServer())
        .post('/api/v1/rewards/redeem')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rewardId: rewardRes.body.id,
        })
        .expect(400);
    });

    it('should fail redemption when out of stock', async () => {
      const rewardRes = await request(app.getHttpServer())
        .post('/api/v1/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Limited Reward',
          pointsCost: 50,
          rewardType: 'gift',
          stockQuantity: 0,
        });

      // User has 0 points and reward is out of stock
      return request(app.getHttpServer())
        .post('/api/v1/rewards/redeem')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rewardId: rewardRes.body.id,
        })
        .expect(400);
    });

    it('should decrement stock quantity after redemption', async () => {
      const rewardRes = await request(app.getHttpServer())
        .post('/api/v1/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Stock Test',
          pointsCost: 50,
          rewardType: 'gift',
          stockQuantity: 5,
        });

      // Give user some points by completing an activity
      const activityRes2 = await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'walking',
        });

      await request(app.getHttpServer())
        .put(`/api/v1/activities/${activityRes2.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed',
          pointsEarned: 100,
        });

      await request(app.getHttpServer())
        .post('/api/v1/rewards/redeem')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rewardId: rewardRes.body.id,
        });

      return request(app.getHttpServer())
        .get(`/api/v1/rewards/${rewardRes.body.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.stockQuantity).toBe(4);
        });
    });
  });

  describe('GET /rewards/redemptions/me', () => {
    it('should list user redemptions', async () => {
      const rewardRes = await request(app.getHttpServer())
        .post('/api/v1/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Reward',
          pointsCost: 50,
          rewardType: 'badge',
          stockQuantity: 10,
        });

      // Give user some points by completing an activity
      const activityRes3 = await request(app.getHttpServer())
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          activityType: 'walking',
        });

      await request(app.getHttpServer())
        .put(`/api/v1/activities/${activityRes3.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed',
          pointsEarned: 100,
        });

      await request(app.getHttpServer())
        .post('/api/v1/rewards/redeem')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rewardId: rewardRes.body.id,
        });

      return request(app.getHttpServer())
        .get('/api/v1/rewards/redemptions/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);
          expect(res.body[0]).toHaveProperty('redemptionCode');
        });
    });
  });

  describe('PUT /rewards/:id', () => {
    it('should update a reward', async () => {
      const rewardRes = await request(app.getHttpServer())
        .post('/api/v1/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Original Name',
          pointsCost: 100,
          rewardType: 'discount',
          stockQuantity: 20,
        });

      return request(app.getHttpServer())
        .put(`/api/v1/rewards/${rewardRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          pointsCost: 120,
          stockQuantity: 15,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Name');
          expect(res.body.pointsCost).toBe(120);
          expect(res.body.stockQuantity).toBe(15);
        });
    });
  });

  describe('DELETE /rewards/:id', () => {
    it('should delete a reward', async () => {
      const rewardRes = await request(app.getHttpServer())
        .post('/api/v1/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'To Delete',
          pointsCost: 75,
          rewardType: 'gift',
          stockQuantity: 5,
        });

      return request(app.getHttpServer())
        .delete(`/api/v1/rewards/${rewardRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
