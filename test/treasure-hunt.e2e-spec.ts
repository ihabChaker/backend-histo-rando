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

describe('Treasure Hunt E2E Tests', () => {
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

  describe('POST /treasure-hunts', () => {
    it('should create a new treasure hunt', () => {
      return request(app.getHttpServer())
        .post('/api/v1/treasure-hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          name: 'Hidden Bunker',
          description: 'Find the hidden bunker entrance',
          targetObject: 'Bunker door',
          latitude: 49.182863,
          longitude: -0.370679,
          scanRadiusMeters: 20,
          pointsReward: 75,
          qrCode: 'BUNKER001',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Hidden Bunker');
          expect(res.body.scanRadiusMeters).toBe(20);
        });
    });

    it('should fail with invalid coordinates', () => {
      return request(app.getHttpServer())
        .post('/api/v1/treasure-hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          name: 'Invalid Treasure',
          targetObject: 'Test Object',
          latitude: 200,
          longitude: -200,
          scanRadiusMeters: 10,
          pointsReward: 50,
        })
        .expect(400);
    });
  });

  describe('GET /treasure-hunts', () => {
    it('should list all treasure hunts (public)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/treasure-hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          name: 'Treasure 1',
          targetObject: 'Hidden cache',
          latitude: 49.182863,
          longitude: -0.370679,
          scanRadiusMeters: 15,
          pointsReward: 50,
        });

      await request(app.getHttpServer())
        .post('/api/v1/treasure-hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          name: 'Treasure 2',
          targetObject: 'Memorial plaque',
          latitude: 49.183,
          longitude: -0.371,
          scanRadiusMeters: 25,
          pointsReward: 75,
        });

      return request(app.getHttpServer())
        .get('/api/v1/treasure-hunts')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThanOrEqual(2);
        });
    });
  });

  describe('POST /treasure-hunts/found', () => {
    it('should record treasure found within radius', async () => {
      const treasureRes = await request(app.getHttpServer())
        .post('/api/v1/treasure-hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          name: 'Test Treasure',
          targetObject: 'Ammunition box',
          latitude: 49.182863,
          longitude: -0.370679,
          scanRadiusMeters: 50,
          pointsReward: 100,
        });

      return request(app.getHttpServer())
        .post('/api/v1/treasure-hunts/found')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          treasureId: treasureRes.body.id,
          latitude: 49.18287,
          longitude: -0.37068,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.found.treasureId).toBe(treasureRes.body.id);
          expect(res.body).toHaveProperty('pointsEarned');
          expect(res.body.pointsEarned).toBe(100);
        });
    });

    it('should fail if user is too far from treasure', async () => {
      const treasureRes = await request(app.getHttpServer())
        .post('/api/v1/treasure-hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          name: 'Distant Treasure',
          targetObject: 'Far bunker',
          latitude: 49.182863,
          longitude: -0.370679,
          scanRadiusMeters: 10,
          pointsReward: 50,
        });

      return request(app.getHttpServer())
        .post('/api/v1/treasure-hunts/found')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          treasureId: treasureRes.body.id,
          latitude: 49.19,
          longitude: -0.38,
        })
        .expect(400);
    });

    it('should prevent duplicate treasure finds', async () => {
      const treasureRes = await request(app.getHttpServer())
        .post('/api/v1/treasure-hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          name: 'Unique Treasure',
          targetObject: 'Unique artifact',
          latitude: 49.182863,
          longitude: -0.370679,
          scanRadiusMeters: 30,
          pointsReward: 75,
        });

      await request(app.getHttpServer())
        .post('/api/v1/treasure-hunts/found')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          treasureId: treasureRes.body.id,
          latitude: 49.18287,
          longitude: -0.37068,
        });

      return request(app.getHttpServer())
        .post('/api/v1/treasure-hunts/found')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          treasureId: treasureRes.body.id,
          latitude: 49.18287,
          longitude: -0.37068,
        })
        .expect(409);
    });
  });

  describe('GET /treasure-hunts/found/me', () => {
    it('should list user found treasures', async () => {
      const treasureRes = await request(app.getHttpServer())
        .post('/api/v1/treasure-hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          name: 'Found Treasure',
          targetObject: 'Found artifact',
          latitude: 49.182863,
          longitude: -0.370679,
          scanRadiusMeters: 50,
          pointsReward: 100,
        });

      await request(app.getHttpServer())
        .post('/api/v1/treasure-hunts/found')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          treasureId: treasureRes.body.id,
          latitude: 49.18287,
          longitude: -0.37068,
        });

      return request(app.getHttpServer())
        .get('/api/v1/treasure-hunts/found/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        });
    });
  });

  describe('GET /treasure-hunts/:id', () => {
    it('should get treasure hunt by id (public)', async () => {
      const treasureRes = await request(app.getHttpServer())
        .post('/api/v1/treasure-hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          name: 'Test Treasure',
          targetObject: 'Test artifact',
          latitude: 49.182863,
          longitude: -0.370679,
          scanRadiusMeters: 20,
          pointsReward: 60,
        });

      return request(app.getHttpServer())
        .get(`/api/v1/treasure-hunts/${treasureRes.body.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(treasureRes.body.id);
          expect(res.body.name).toBe('Test Treasure');
        });
    });
  });

  describe('DELETE /treasure-hunts/:id', () => {
    it('should delete a treasure hunt', async () => {
      const treasureRes = await request(app.getHttpServer())
        .post('/api/v1/treasure-hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          name: 'To Delete',
          targetObject: 'Delete target',
          latitude: 49.182863,
          longitude: -0.370679,
          scanRadiusMeters: 15,
          pointsReward: 40,
        });

      return request(app.getHttpServer())
        .delete(`/api/v1/treasure-hunts/${treasureRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
