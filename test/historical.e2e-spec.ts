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

describe('Historical E2E Tests', () => {
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

  describe('POST /historical/battalions', () => {
    it('should create a new battalion', () => {
      return request(app.getHttpServer())
        .post('/api/v1/historical/battalions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '116th Infantry Regiment',
          country: 'United States',
          militaryUnit: '29th Infantry Division',
          period: 'June 6-7, 1944',
          description: 'Landed on Omaha Beach',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('116th Infantry Regiment');
          expect(res.body.country).toBe('United States');
          expect(res.body.militaryUnit).toBe('29th Infantry Division');
        });
    });

    it('should create battalion without optional fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/historical/battalions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '2nd Ranger Battalion',
          country: 'United States',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('2nd Ranger Battalion');
        });
    });
  });

  describe('GET /historical/battalions', () => {
    it('should list all battalions (public)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/historical/battalions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Battalion 1',
          country: 'France',
          militaryUnit: 'Free French Forces',
        });

      await request(app.getHttpServer())
        .post('/api/v1/historical/battalions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Battalion 2',
          country: 'United Kingdom',
          militaryUnit: 'British Army',
        });

      return request(app.getHttpServer())
        .get('/api/v1/historical/battalions')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
        });
    });
  });

  describe('GET /historical/battalions/:id', () => {
    it('should get battalion by id (public)', async () => {
      const battalionRes = await request(app.getHttpServer())
        .post('/api/v1/historical/battalions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Battalion',
          country: 'Canada',
          militaryUnit: 'Canadian Army',
          description: 'Juno Beach landing force',
        });

      return request(app.getHttpServer())
        .get(`/api/v1/historical/battalions/${battalionRes.body.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(battalionRes.body.id);
          expect(res.body.name).toBe('Test Battalion');
        });
    });
  });

  describe('PUT /historical/battalions/:id', () => {
    it('should update a battalion', async () => {
      const battalionRes = await request(app.getHttpServer())
        .post('/api/v1/historical/battalions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Original Name',
          country: 'Germany',
          militaryUnit: '352nd Infantry Division',
        });

      return request(app.getHttpServer())
        .put(`/api/v1/historical/battalions/${battalionRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          description: 'Added description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Name');
          expect(res.body.description).toBe('Added description');
        });
    });
  });

  describe('DELETE /historical/battalions/:id', () => {
    it('should delete a battalion', async () => {
      const battalionRes = await request(app.getHttpServer())
        .post('/api/v1/historical/battalions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'To Delete',
          country: 'Poland',
        });

      return request(app.getHttpServer())
        .delete(`/api/v1/historical/battalions/${battalionRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('POST /historical/routes', () => {
    it('should create a battalion route', async () => {
      const battalionRes = await request(app.getHttpServer())
        .post('/api/v1/historical/battalions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Battalion',
          country: 'United States',
        });

      return request(app.getHttpServer())
        .post('/api/v1/historical/routes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          battalionId: battalionRes.body.id,
          parcoursId: parcoursId,
          routeDate: '1944-06-06',
          historicalContext: 'Advance from Omaha Beach',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.battalionId).toBe(battalionRes.body.id);
          expect(res.body.parcoursId).toBe(parcoursId);
          expect(res.body.routeDate).toBe('1944-06-06');
        });
    });

    it('should fail with non-existent battalion', () => {
      return request(app.getHttpServer())
        .post('/api/v1/historical/routes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          battalionId: 99999,
          parcoursId: parcoursId,
          routeDate: '1944-06-06',
        })
        .expect(404);
    });
  });

  describe('GET /historical/routes/battalion/:battalionId', () => {
    it('should get routes by battalion (public)', async () => {
      const battalionRes = await request(app.getHttpServer())
        .post('/api/v1/historical/battalions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Battalion',
          country: 'United Kingdom',
        });

      await request(app.getHttpServer())
        .post('/api/v1/historical/routes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          battalionId: battalionRes.body.id,
          parcoursId: parcoursId,
          routeDate: '1944-06-06',
        });

      return request(app.getHttpServer())
        .get(`/api/v1/historical/routes/battalion/${battalionRes.body.id}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);
        });
    });
  });

  describe('GET /historical/routes/parcours/:parcoursId', () => {
    it('should get routes by parcours (public)', async () => {
      const battalion1 = await request(app.getHttpServer())
        .post('/api/v1/historical/battalions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Battalion 1',
          country: 'France',
        });

      const battalion2 = await request(app.getHttpServer())
        .post('/api/v1/historical/battalions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Battalion 2',
          country: 'Canada',
        });

      await request(app.getHttpServer())
        .post('/api/v1/historical/routes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          battalionId: battalion1.body.id,
          parcoursId: parcoursId,
          routeDate: '1944-06-06',
        });

      await request(app.getHttpServer())
        .post('/api/v1/historical/routes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          battalionId: battalion2.body.id,
          parcoursId: parcoursId,
          routeDate: '1944-06-07',
        });

      return request(app.getHttpServer())
        .get(`/api/v1/historical/routes/parcours/${parcoursId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
        });
    });
  });

  describe('PUT /historical/routes/:id', () => {
    it('should update a battalion route', async () => {
      const battalionRes = await request(app.getHttpServer())
        .post('/api/v1/historical/battalions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Battalion',
          country: 'United States',
        });

      const routeRes = await request(app.getHttpServer())
        .post('/api/v1/historical/routes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          battalionId: battalionRes.body.id,
          parcoursId: parcoursId,
          routeDate: '1944-06-06',
        });

      return request(app.getHttpServer())
        .put(`/api/v1/historical/routes/${routeRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          routeDate: '1944-06-07',
          historicalContext: 'Updated context',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.routeDate).toBe('1944-06-07');
          expect(res.body.historicalContext).toBe('Updated context');
        });
    });
  });

  describe('DELETE /historical/routes/:id', () => {
    it('should delete a battalion route', async () => {
      const battalionRes = await request(app.getHttpServer())
        .post('/api/v1/historical/battalions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Battalion',
          country: 'United States',
        });

      const routeRes = await request(app.getHttpServer())
        .post('/api/v1/historical/routes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          battalionId: battalionRes.body.id,
          parcoursId: parcoursId,
          routeDate: '1944-06-06',
        });

      return request(app.getHttpServer())
        .delete(`/api/v1/historical/routes/${routeRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
