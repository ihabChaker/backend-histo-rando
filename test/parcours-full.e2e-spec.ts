import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import request from "supertest";
import { AppModule } from "../src/app.module";
import {
  setupTestDatabase,
  syncDatabase,
  cleanDatabase,
  closeDatabase,
} from "./helpers/database.helper";
import {
  createRegisterData,
  createParcoursData,
  createEasyParcours,
  createHardParcours,
  createPmrAccessibleParcours,
  createInactiveParcours,
  createParcoursArray,
} from "./factories";

describe("Parcours E2E Tests (Real Database)", () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    await setupTestDatabase();
    await syncDatabase(true);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ZodValidationPipe());

    await app.init();

    // Register a user for authenticated requests
    const registerData = createRegisterData();
    const registerResponse = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send(registerData);

    authToken = registerResponse.body.access_token;
  });

  afterAll(async () => {
    await closeDatabase();
    await app.close();
  });

  afterEach(async () => {
    // Clean parcours after each test
    await cleanDatabase();
  });

  describe("Parcours CRUD Operations", () => {
    it("should create a new parcours", async () => {
      const parcoursData = createParcoursData({
        name: "Omaha Beach Trail",
        description: "Historical D-Day landing site trail",
      });

      const response = await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(parcoursData)
        .expect(201);

      expect(response.body.name).toBe("Omaha Beach Trail");
      expect(response.body).toHaveProperty("id");
      expect(response.body.difficultyLevel).toBe("medium");
      expect(response.body.isActive).toBe(true);
    });

    it("should get all parcours", async () => {
      // Create multiple parcours
      const parcoursArray = createParcoursArray(3);

      for (const parcoursData of parcoursArray) {
        await request(app.getHttpServer())
          .post("/api/v1/parcours")
          .set("Authorization", `Bearer ${authToken}`)
          .send(parcoursData);
      }

      const response = await request(app.getHttpServer())
        .get("/api/v1/parcours")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });

    it("should get a single parcours by ID", async () => {
      const parcoursData = createParcoursData();

      const createResponse = await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(parcoursData);

      const parcoursId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/parcours/${parcoursId}`)
        .expect(200);

      expect(response.body.id).toBe(parcoursId);
      expect(response.body.name).toBe(parcoursData.name);
    });

    it("should update a parcours", async () => {
      const parcoursData = createParcoursData();

      const createResponse = await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(parcoursData);

      const parcoursId = createResponse.body.id;

      const updateData = {
        name: "Updated Trail Name",
        description: "Updated trail description",
        difficultyLevel: "hard",
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/parcours/${parcoursId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe("Updated Trail Name");
      expect(response.body.difficultyLevel).toBe("hard");
    });

    it("should delete a parcours", async () => {
      const parcoursData = createParcoursData();

      const createResponse = await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(parcoursData);

      const parcoursId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/api/v1/parcours/${parcoursId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/api/v1/parcours/${parcoursId}`)
        .expect(404);
    });
  });

  describe("Parcours Difficulty Levels", () => {
    it("should create easy parcours", async () => {
      const easyParcours = createEasyParcours({
        name: "Easy Beach Walk",
      });

      const response = await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(easyParcours)
        .expect(201);

      expect(response.body.difficultyLevel).toBe("easy");
      expect(response.body.isPmrAccessible).toBe(true);
    });

    it("should create hard parcours", async () => {
      const hardParcours = createHardParcours({
        name: "Challenging Mountain Trail",
      });

      const response = await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(hardParcours)
        .expect(201);

      expect(response.body.difficultyLevel).toBe("hard");
      expect(response.body.distanceKm).toBeGreaterThan(10);
    });

    it("should filter by difficulty level", async () => {
      // Create parcours with different difficulties
      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createEasyParcours());

      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createHardParcours());

      const response = await request(app.getHttpServer())
        .get("/api/v1/parcours")
        .query({ difficultyLevel: "easy" })
        .expect(200);

      expect(
        response.body.every((p: any) => p.difficultyLevel === "easy")
      ).toBe(true);
    });
  });

  describe("PMR Accessibility", () => {
    it("should create PMR accessible parcours", async () => {
      const pmrParcours = createPmrAccessibleParcours({
        name: "Wheelchair Accessible Trail",
      });

      const response = await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(pmrParcours)
        .expect(201);

      expect(response.body.isPmrAccessible).toBe(true);
    });

    it("should filter by PMR accessibility", async () => {
      // Create both PMR and non-PMR parcours
      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createPmrAccessibleParcours());

      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createParcoursData({ isPmrAccessible: false }));

      const response = await request(app.getHttpServer())
        .get("/api/v1/parcours")
        .query({ isPmrAccessible: true })
        .expect(200);

      expect(response.body.every((p: any) => p.isPmrAccessible === true)).toBe(
        true
      );
    });
  });

  describe("Active/Inactive Parcours", () => {
    it("should create active parcours by default", async () => {
      const parcoursData = createParcoursData();

      const response = await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(parcoursData)
        .expect(201);

      expect(response.body.isActive).toBe(true);
    });

    it("should create inactive parcours", async () => {
      const inactiveParcours = createInactiveParcours({
        name: "Under Maintenance Trail",
      });

      const response = await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(inactiveParcours)
        .expect(201);

      expect(response.body.isActive).toBe(false);
    });

    it("should filter by active status", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createParcoursData({ isActive: true }));

      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createInactiveParcours());

      const response = await request(app.getHttpServer())
        .get("/api/v1/parcours")
        .query({ isActive: true })
        .expect(200);

      expect(response.body.every((p: any) => p.isActive === true)).toBe(true);
    });
  });

  describe("Distance Filtering", () => {
    it("should filter by minimum distance", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createParcoursData({ distanceKm: 3.0 }));

      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createParcoursData({ distanceKm: 10.0 }));

      const response = await request(app.getHttpServer())
        .get("/api/v1/parcours")
        .query({ minDistance: 8.0 })
        .expect(200);

      expect(response.body.every((p: any) => p.distanceKm >= 8.0)).toBe(true);
    });

    it("should filter by maximum distance", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createParcoursData({ distanceKm: 3.0 }));

      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createParcoursData({ distanceKm: 15.0 }));

      const response = await request(app.getHttpServer())
        .get("/api/v1/parcours")
        .query({ maxDistance: 10.0 })
        .expect(200);

      expect(response.body.every((p: any) => p.distanceKm <= 10.0)).toBe(true);
    });

    it("should filter by distance range", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createParcoursData({ distanceKm: 2.0 }));

      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createParcoursData({ distanceKm: 7.0 }));

      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createParcoursData({ distanceKm: 20.0 }));

      const response = await request(app.getHttpServer())
        .get("/api/v1/parcours")
        .query({ minDistance: 5.0, maxDistance: 15.0 })
        .expect(200);

      expect(
        response.body.every(
          (p: any) => p.distanceKm >= 5.0 && p.distanceKm <= 15.0
        )
      ).toBe(true);
    });
  });

  describe("Nearby Parcours Search", () => {
    it("should find nearby parcours", async () => {
      const nearbyParcours = createParcoursData({
        startingPointLat: 49.3394,
        startingPointLon: -0.8566,
      });

      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(nearbyParcours);

      const response = await request(app.getHttpServer())
        .get("/api/v1/parcours/nearby")
        .query({ lat: 49.34, lon: -0.86, radius: 50 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("Parcours Validation", () => {
    it("should require authentication for creating parcours", async () => {
      const parcoursData = createParcoursData();

      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .send(parcoursData)
        .expect(401);
    });

    it("should validate required fields", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test", // Missing required fields
        })
        .expect(400);
    });

    it("should validate difficulty level enum", async () => {
      const parcoursData = createParcoursData({
        difficultyLevel: "invalid" as any,
      });

      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(parcoursData)
        .expect(400);
    });

    it("should return 404 for non-existent parcours", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/parcours/99999")
        .expect(404);
    });
  });

  describe("Multiple Filters Combined", () => {
    it("should apply multiple filters together", async () => {
      // Create various parcours
      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createEasyParcours({ distanceKm: 4.0, isPmrAccessible: true }));

      await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(createHardParcours({ distanceKm: 15.0, isPmrAccessible: false }));

      const response = await request(app.getHttpServer())
        .get("/api/v1/parcours")
        .query({
          difficultyLevel: "easy",
          isPmrAccessible: true,
          maxDistance: 10.0,
        })
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].difficultyLevel).toBe("easy");
      expect(response.body[0].isPmrAccessible).toBe(true);
    });
  });
});
