import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Treasure Items (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let parcoursId: number;
  let treasureHuntId: number;
  let treasureItemId: number;
  let treasureItemQr: string;

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
        email: `treasuretest${timestamp}@example.com`,
        username: `treasuretest${timestamp}`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        isPmr: false,
      })
      .expect(201);

    authToken = registerResponse.body.access_token;

    // Create parcours
    const parcoursResponse = await request(app.getHttpServer())
      .post('/api/v1/parcours')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Treasure Test Parcours',
        description: 'Test parcours',
        difficultyLevel: 'easy',
        distanceKm: 3.0,
        estimatedDuration: 45,
        isPmrAccessible: true,
        isActive: true,
        historicalTheme: 'Test',
        startingPointLat: 49.3,
        startingPointLon: -0.85,
        endingPointLat: 49.31,
        endingPointLon: -0.86,
      })
      .expect(201);

    parcoursId = parcoursResponse.body.id;

    // Create treasure hunt
    const huntResponse = await request(app.getHttpServer())
      .post('/api/v1/treasure-hunts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        parcoursId,
        name: 'Test Treasure Hunt',
        description: 'Multi-item treasure hunt',
        targetObject: 'Test Artifacts',
        latitude: 49.305,
        longitude: -0.855,
        scanRadiusMeters: 50,
        pointsReward: 100,
        isActive: true,
      })
      .expect(201);

    treasureHuntId = huntResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/treasure-hunts/:huntId/items (GET)', () => {
    it('should get all items for a treasure hunt', async () => {
      // Create a treasure item first
      const itemResponse = await request(app.getHttpServer())
        .post('/api/v1/treasure-hunts/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          treasureHuntId,
          itemName: 'Test Artifact 1',
          description: 'First test artifact',
          pointsValue: 10,
        })
        .expect(201);

      // Get items
      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasure-hunts/${treasureHuntId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('itemName');
      expect(response.body[0]).toHaveProperty('qrCode');
      expect(response.body[0]).toHaveProperty('pointsValue');
    });
  });

  describe('/api/v1/treasure-hunts/items (POST)', () => {
    it('should create a new treasure item', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/treasure-hunts/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          treasureHuntId,
          itemName: 'Test Item 2',
          description: 'A test treasure item',
          pointsValue: 25,
        })
        .expect(201);

      treasureItemId = response.body.id;
      treasureItemQr = response.body.qrCode;

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('qrCode');
      expect(response.body.itemName).toBe('Test Item 2');
      expect(response.body.qrCode).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ); // UUID v4 format
    });
  });

  describe('/api/v1/treasure-hunts/items/scan (POST)', () => {
    it('should scan a treasure item QR code and earn points', async () => {
      // Scan the item
      const response = await request(app.getHttpServer())
        .post('/api/v1/treasure-hunts/items/scan')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          qrCode: treasureItemQr,
        })
        .expect(201);

      expect(response.body).toHaveProperty('item');
      expect(response.body).toHaveProperty('treasureHunt');
      expect(response.body).toHaveProperty('pointsEarned');
      expect(response.body).toHaveProperty('isNewFind');
      expect(response.body).toHaveProperty('totalItemsFound');
      expect(response.body).toHaveProperty('totalItemsInHunt');
      expect(response.body).toHaveProperty('huntComplete');
      expect(response.body.isNewFind).toBe(true);
      expect(response.body.pointsEarned).toBeGreaterThan(0);
    });

    it('should not earn points for scanning same item twice', async () => {
      // Scan second time
      const response = await request(app.getHttpServer())
        .post('/api/v1/treasure-hunts/items/scan')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          qrCode: treasureItemQr,
        })
        .expect(201);

      expect(response.body.isNewFind).toBe(false);
      expect(response.body.pointsEarned).toBe(0);
    });
  });
});
