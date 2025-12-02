import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from '../src/app.module';
import {
  setSequelizeInstance,
  syncDatabase,
  cleanDatabase,
  closeDatabase,
} from './helpers/database.helper';
import { createRegisterData } from './factories';

describe('Admin E2E Tests', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let regularUserId: number;

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

    // Create admin user
    const adminData = createRegisterData({
      email: 'admin@histo-rando.com',
      username: 'admin',
    });
    const adminResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(adminData);
    adminToken = adminResponse.body.access_token;

    // Manually set admin role (in real scenario, this would be done via DB migration or seed)
    const adminUser = await sequelize.models['User'].findOne({
      where: { email: adminData.email },
    });
    if (!adminUser) {
      throw new Error('Admin user not found after registration');
    }
    await adminUser.update({ role: 'admin' });

    // Re-authenticate to obtain a token that contains the updated role claim
    const relogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: adminData.email, password: adminData.password });
    adminToken = relogin.body.access_token;

    // Create regular user
    const userData = createRegisterData({
      email: 'user@histo-rando.com',
      username: 'regularuser',
    });
    const userResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(userData);
    userToken = userResponse.body.access_token;
    regularUserId = userResponse.body.user.id;
  });

  afterAll(async () => {
    await closeDatabase();
    await app.close();
  });

  beforeEach(async () => {
    // Note: We don't clean the database between tests in this suite
    // because we need the admin and regular users to persist
  });

  describe('GET /admin/stats', () => {
    it('should return dashboard statistics for admin', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('users');
          expect(res.body).toHaveProperty('content');
          expect(res.body).toHaveProperty('activity');
          expect(res.body.users).toHaveProperty('total');
          expect(res.body.users).toHaveProperty('newLast30Days');
          expect(res.body.users).toHaveProperty('pmrUsers');
          expect(res.body.content).toHaveProperty('parcours');
          expect(res.body.content).toHaveProperty('pois');
        });
    });

    it('should deny access to regular users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should deny access without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/stats')
        .expect(401);
    });
  });

  describe('GET /admin/users', () => {
    it('should return paginated list of users for admin', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('users');
          expect(res.body).toHaveProperty('limit');
          expect(res.body).toHaveProperty('offset');
          expect(Array.isArray(res.body.users)).toBe(true);
          expect(res.body.total).toBeGreaterThanOrEqual(2); // At least admin and regular user
        });
    });

    it('should filter users by role', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .query({ role: 'admin' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.users.every((u: any) => u.role === 'admin')).toBe(
            true,
          );
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .query({ limit: 1, offset: 0 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.limit).toBe(1);
          expect(res.body.offset).toBe(0);
          expect(res.body.users.length).toBeLessThanOrEqual(1);
        });
    });

    it('should deny access to regular users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /admin/users/:id', () => {
    it('should return detailed user information for admin', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', regularUserId);
          expect(res.body).toHaveProperty('username');
          expect(res.body).toHaveProperty('email');
          expect(res.body).not.toHaveProperty('passwordHash');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should deny access to regular users', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('PUT /admin/users/:id/role', () => {
    it('should update user role for admin', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/admin/users/${regularUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(200);

      expect(response.body.role).toBe('admin');

      // Verify the change
      const userCheck = await request(app.getHttpServer())
        .get(`/api/v1/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(userCheck.body.role).toBe('admin');

      // Restore to user role
      await request(app.getHttpServer())
        .put(`/api/v1/admin/users/${regularUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'user' });
    });

    it('should validate role enum', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/admin/users/${regularUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'invalid' })
        .expect(400);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .put('/api/v1/admin/users/99999/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(404);
    });

    it('should deny access to regular users', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/admin/users/${regularUserId}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' })
        .expect(403);
    });
  });

  describe('GET /admin/activities/recent', () => {
    it('should return recent activities for admin', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/activities/recent')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should respect limit parameter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/activities/recent')
        .query({ limit: 5 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBeLessThanOrEqual(5);
        });
    });

    it('should deny access to regular users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/activities/recent')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /admin/stats/content', () => {
    it('should return content statistics for admin', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/stats/content')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('parcoursByDifficulty');
          expect(res.body).toHaveProperty('poisByType');
          expect(Array.isArray(res.body.parcoursByDifficulty)).toBe(true);
          expect(Array.isArray(res.body.poisByType)).toBe(true);
        });
    });

    it('should deny access to regular users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/stats/content')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /admin/stats/user-growth', () => {
    it('should return user growth statistics for admin', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/stats/user-growth')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('date');
            expect(res.body[0]).toHaveProperty('newUsers');
          }
        });
    });

    it('should respect days parameter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/stats/user-growth')
        .query({ days: 7 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should deny access to regular users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/stats/user-growth')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('DELETE /admin/users/:id', () => {
    it('should delete user for admin', async () => {
      // Create a user to delete
      const deleteUserData = createRegisterData({
        email: 'todelete@histo-rando.com',
        username: 'todelete',
      });
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(deleteUserData);
      const userIdToDelete = createResponse.body.user.id;

      // Delete the user
      await request(app.getHttpServer())
        .delete(`/api/v1/admin/users/${userIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify user is deleted
      await request(app.getHttpServer())
        .get(`/api/v1/admin/users/${userIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/admin/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should deny access to regular users', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
