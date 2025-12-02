import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Sequelize } from 'sequelize-typescript';
import {
  setSequelizeInstance,
  syncDatabase,
  cleanDatabase,
  closeDatabase,
} from './helpers/database.helper';
import { createRegisterData, createPmrUser } from './factories';

describe('Users E2E Tests (Real Database)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;

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
    await closeDatabase();
    await app.close();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('User Registration and Profile Management', () => {
    it('should register a new user and access profile', async () => {
      const registerData = createRegisterData({
        firstName: 'Alice',
        lastName: 'Johnson',
      });

      // Register
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('access_token');
      expect(registerResponse.body.user.email).toBe(registerData.email);
      expect(registerResponse.body.user.firstName).toBe('Alice');

      authToken = registerResponse.body.access_token;
      userId = registerResponse.body.user.id;

      // Get current user profile
      const profileResponse = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(profileResponse.body.id).toBe(userId);
      expect(profileResponse.body.email).toBe(registerData.email);
      expect(profileResponse.body.totalPoints).toBe(0);
      expect(profileResponse.body.totalKm).toBe(0);
    });

    it('should update user profile', async () => {
      const registerData = createRegisterData();

      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData)
        .expect(201);

      authToken = registerResponse.body.access_token;

      // Update profile
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '+33612345678',
      };

      const updateResponse = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.firstName).toBe('Updated');
      expect(updateResponse.body.lastName).toBe('Name');
      expect(updateResponse.body.phoneNumber).toBe('+33612345678');
    });

    it('should get user stats', async () => {
      const registerData = createRegisterData();

      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData)
        .expect(201);

      authToken = registerResponse.body.access_token;

      // Get stats
      const statsResponse = await request(app.getHttpServer())
        .get('/api/v1/users/me/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(statsResponse.body).toHaveProperty('totalPoints');
      expect(statsResponse.body).toHaveProperty('totalKm');
      expect(statsResponse.body).toHaveProperty('totalParcours');
      expect(statsResponse.body).toHaveProperty('totalPOIsVisited');
    });

    it('should register PMR user with accessibility flag', async () => {
      const pmrData = createPmrUser({
        firstName: 'Accessible',
        lastName: 'User',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(pmrData)
        .expect(201);

      expect(response.body.user.isPmr).toBe(true);
    });

    it('should fail to access profile without authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
    });

    it('should fail to update profile without authentication', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({ firstName: 'Test' })
        .expect(401);
    });
  });

  describe('User Points and Kilometers Tracking', () => {
    beforeEach(async () => {
      const registerData = createRegisterData();
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData);

      authToken = registerResponse.body.access_token;
      userId = registerResponse.body.user.id;
    });

    it('should track user points correctly', async () => {
      // Get initial stats
      const initialStats = await request(app.getHttpServer())
        .get('/api/v1/users/me/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(initialStats.body.totalPoints).toBe(0);

      // In a real scenario, points would be added through completing activities
      // This test verifies the stats endpoint works
      const currentStats = await request(app.getHttpServer())
        .get('/api/v1/users/me/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(currentStats.body).toHaveProperty('totalPoints');
      expect(typeof currentStats.body.totalPoints).toBe('number');
    });

    it('should track kilometers correctly', async () => {
      const stats = await request(app.getHttpServer())
        .get('/api/v1/users/me/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(stats.body.totalKm).toBe(0);
      expect(typeof stats.body.totalKm).toBe('number');
    });
  });

  describe('Multiple Users Management', () => {
    it('should handle multiple user registrations', async () => {
      const users = [
        createRegisterData({ firstName: 'User1' }),
        createRegisterData({ firstName: 'User2' }),
        createRegisterData({ firstName: 'User3' }),
      ];

      for (const userData of users) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.user.firstName).toBe(userData.firstName);
      }
    });

    it('should maintain separate profiles for different users', async () => {
      // Register first user
      const user1Data = createRegisterData({ firstName: 'FirstUser' });
      const user1Response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(user1Data)
        .expect(201);

      const user1Token = user1Response.body.access_token;

      // Register second user
      const user2Data = createRegisterData({ firstName: 'SecondUser' });
      const user2Response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(user2Data)
        .expect(201);

      const user2Token = user2Response.body.access_token;

      // Verify profiles are separate
      const profile1 = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const profile2 = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(profile1.body.firstName).toBe('FirstUser');
      expect(profile2.body.firstName).toBe('SecondUser');
      expect(profile1.body.id).not.toBe(profile2.body.id);
    });
  });
});
