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
  createPOIData,
  createMonumentPOI,
  createMemorialPOI,
  createPOIArray,
} from "./factories";

describe("POI E2E Tests (Real Database)", () => {
  let app: INestApplication;
  let authToken: string;
  let parcoursId: number;

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

    // Create a user and parcours for testing
    const registerData = createRegisterData();
    const registerResponse = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send(registerData);

    authToken = registerResponse.body.access_token;

    const parcoursData = createParcoursData();
    const parcoursResponse = await request(app.getHttpServer())
      .post("/api/v1/parcours")
      .set("Authorization", `Bearer ${authToken}`)
      .send(parcoursData);

    parcoursId = parcoursResponse.body.id;
  });

  afterAll(async () => {
    await closeDatabase();
    await app.close();
  });

  afterEach(async () => {
    // Clean only POIs after each test, keep the parcours
    await request(app.getHttpServer())
      .get("/api/v1/poi/parcours/" + parcoursId)
      .set("Authorization", `Bearer ${authToken}`)
      .then(async (response) => {
        for (const poi of response.body) {
          await request(app.getHttpServer())
            .delete(`/api/v1/poi/${poi.id}`)
            .set("Authorization", `Bearer ${authToken}`);
        }
      });
  });

  describe("POI CRUD Operations", () => {
    it("should create a new POI", async () => {
      const poiData = createPOIData(parcoursId, {
        name: "Omaha Beach Memorial",
        description: "Historic D-Day landing site",
      });

      const response = await request(app.getHttpServer())
        .post("/api/v1/poi")
        .set("Authorization", `Bearer ${authToken}`)
        .send(poiData)
        .expect(201);

      expect(response.body.name).toBe("Omaha Beach Memorial");
      expect(response.body.parcoursId).toBe(parcoursId);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("latitude");
      expect(response.body).toHaveProperty("longitude");
    });

    it("should get all POIs for a parcours", async () => {
      // Create multiple POIs
      const pois = createPOIArray(parcoursId, 3);

      for (const poiData of pois) {
        await request(app.getHttpServer())
          .post("/api/v1/poi")
          .set("Authorization", `Bearer ${authToken}`)
          .send(poiData);
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/poi/parcours/${parcoursId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });

    it("should get a single POI by ID", async () => {
      const poiData = createPOIData(parcoursId);

      const createResponse = await request(app.getHttpServer())
        .post("/api/v1/poi")
        .set("Authorization", `Bearer ${authToken}`)
        .send(poiData);

      const poiId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/poi/${poiId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(poiId);
      expect(response.body.name).toBe(poiData.name);
    });

    it("should update a POI", async () => {
      const poiData = createPOIData(parcoursId);

      const createResponse = await request(app.getHttpServer())
        .post("/api/v1/poi")
        .set("Authorization", `Bearer ${authToken}`)
        .send(poiData);

      const poiId = createResponse.body.id;

      const updateData = {
        name: "Updated POI Name",
        description: "Updated description",
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/poi/${poiId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe("Updated POI Name");
      expect(response.body.description).toBe("Updated description");
    });

    it("should delete a POI", async () => {
      const poiData = createPOIData(parcoursId);

      const createResponse = await request(app.getHttpServer())
        .post("/api/v1/poi")
        .set("Authorization", `Bearer ${authToken}`)
        .send(poiData);

      const poiId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/api/v1/poi/${poiId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/api/v1/poi/${poiId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe("POI Types", () => {
    it("should create a monument POI", async () => {
      const monumentData = createMonumentPOI(parcoursId, {
        name: "War Monument",
      });

      const response = await request(app.getHttpServer())
        .post("/api/v1/poi")
        .set("Authorization", `Bearer ${authToken}`)
        .send(monumentData)
        .expect(201);

      expect(response.body.poiType).toBe("monument");
    });

    it("should create a memorial POI", async () => {
      const memorialData = createMemorialPOI(parcoursId, {
        name: "American Cemetery",
      });

      const response = await request(app.getHttpServer())
        .post("/api/v1/poi")
        .set("Authorization", `Bearer ${authToken}`)
        .send(memorialData)
        .expect(201);

      expect(response.body.poiType).toBe("memorial");
    });

    it("should create POIs with different types in same parcours", async () => {
      const monument = createMonumentPOI(parcoursId);
      const memorial = createMemorialPOI(parcoursId);

      await request(app.getHttpServer())
        .post("/api/v1/poi")
        .set("Authorization", `Bearer ${authToken}`)
        .send(monument)
        .expect(201);

      await request(app.getHttpServer())
        .post("/api/v1/poi")
        .set("Authorization", `Bearer ${authToken}`)
        .send(memorial)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/poi/parcours/${parcoursId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBe(2);
      const types = response.body.map((poi: any) => poi.poiType);
      expect(types).toContain("monument");
      expect(types).toContain("memorial");
    });
  });

  describe("POI Ordering", () => {
    it("should maintain order of POIs in parcours", async () => {
      const pois = [
        createPOIData(parcoursId, { orderInParcours: 1, name: "First POI" }),
        createPOIData(parcoursId, { orderInParcours: 2, name: "Second POI" }),
        createPOIData(parcoursId, { orderInParcours: 3, name: "Third POI" }),
      ];

      for (const poiData of pois) {
        await request(app.getHttpServer())
          .post("/api/v1/poi")
          .set("Authorization", `Bearer ${authToken}`)
          .send(poiData);
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/poi/parcours/${parcoursId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body[0].name).toBe("First POI");
      expect(response.body[1].name).toBe("Second POI");
      expect(response.body[2].name).toBe("Third POI");
    });
  });

  describe("POI Validation", () => {
    it("should require authentication for creating POI", async () => {
      const poiData = createPOIData(parcoursId);

      await request(app.getHttpServer())
        .post("/api/v1/poi")
        .send(poiData)
        .expect(401);
    });

    it("should validate latitude bounds", async () => {
      const poiData = createPOIData(parcoursId, {
        latitude: 100, // Invalid: > 90
      });

      await request(app.getHttpServer())
        .post("/api/v1/poi")
        .set("Authorization", `Bearer ${authToken}`)
        .send(poiData)
        .expect(400);
    });

    it("should validate longitude bounds", async () => {
      const poiData = createPOIData(parcoursId, {
        longitude: -200, // Invalid: < -180
      });

      await request(app.getHttpServer())
        .post("/api/v1/poi")
        .set("Authorization", `Bearer ${authToken}`)
        .send(poiData)
        .expect(400);
    });

    it("should return 404 for non-existent POI", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/poi/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe("POI with Media", () => {
    it("should create POI with image URL", async () => {
      const poiData = createPOIData(parcoursId, {
        imageUrl: "https://example.com/images/omaha-beach.jpg",
      });

      const response = await request(app.getHttpServer())
        .post("/api/v1/poi")
        .set("Authorization", `Bearer ${authToken}`)
        .send(poiData)
        .expect(201);

      expect(response.body.imageUrl).toBe(
        "https://example.com/images/omaha-beach.jpg"
      );
    });

    it("should create POI with audio URL", async () => {
      const poiData = createPOIData(parcoursId, {
        audioUrl: "https://example.com/audio/guide.mp3",
      });

      const response = await request(app.getHttpServer())
        .post("/api/v1/poi")
        .set("Authorization", `Bearer ${authToken}`)
        .send(poiData)
        .expect(201);

      expect(response.body.audioUrl).toBe(
        "https://example.com/audio/guide.mp3"
      );
    });
  });
});
