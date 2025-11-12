import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Parcours E2E Tests", () => {
  let app: INestApplication;
  let authToken: string;
  let parcoursId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ZodValidationPipe());

    await app.init();

    // Register and login to get auth token
    const timestamp = Date.now();
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({
        email: `parcourstest${timestamp}@example.com`,
        username: `parcourstest${timestamp}`,
        password: "SecurePassword123!",
        firstName: "Parcours",
        lastName: "Test",
        isPmr: false,
      });

    authToken = response.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/api/v1/parcours (GET)", () => {
    it("should get all parcours without authentication (public)", () => {
      return request(app.getHttpServer())
        .get("/api/v1/parcours")
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });
  });

  describe("/api/v1/parcours (POST)", () => {
    it("should create a new parcours with authentication", () => {
      return request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "E2E Test Parcours",
          description: "Test description for E2E",
          difficultyLevel: "medium",
          distanceKm: 10.5,
          estimatedDuration: 120,
          isPmrAccessible: true,
          isActive: true,
          historicalTheme: "D-Day 1944",
          startingPointLat: 49.3394,
          startingPointLon: -0.8566,
          endingPointLat: 49.35,
          endingPointLon: -0.87,
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty("id");
          expect(response.body.name).toBe("E2E Test Parcours");
          parcoursId = response.body.id;
        });
    });

    it("should fail to create parcours without authentication", () => {
      return request(app.getHttpServer())
        .post("/api/v1/parcours")
        .send({
          name: "Test Parcours",
          description: "Test description",
          difficultyLevel: "easy",
          distanceKm: 5.0,
          estimatedDuration: 60,
          isPmrAccessible: true,
          historicalTheme: "Test Theme",
          startingPointLat: 49.3394,
          startingPointLon: -0.8566,
        })
        .expect(401);
    });
  });

  describe("/api/v1/parcours/:id (GET)", () => {
    it("should get a specific parcours by id (public)", async () => {
      // First create a parcours
      const createResponse = await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Get Parcours",
          description: "Test description",
          difficultyLevel: "easy",
          distanceKm: 5.0,
          estimatedDuration: 60,
          isPmrAccessible: true,
          historicalTheme: "Test Theme",
          startingPointLat: 49.3394,
          startingPointLon: -0.8566,
        });

      const id = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/api/v1/parcours/${id}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(id);
          expect(response.body.name).toBe("Test Get Parcours");
        });
    });

    it("should return 404 for non-existent parcours", () => {
      return request(app.getHttpServer())
        .get("/api/v1/parcours/999999")
        .expect(404);
    });
  });

  describe("/api/v1/parcours/nearby (GET)", () => {
    it("should find nearby parcours (public)", () => {
      return request(app.getHttpServer())
        .get("/api/v1/parcours/nearby")
        .query({ lat: 49.3394, lon: -0.8566, radius: 50 })
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });
  });

  describe("/api/v1/parcours/:id (PUT)", () => {
    it("should update a parcours with authentication", async () => {
      // First create a parcours
      const createResponse = await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Original Name",
          description: "Original description",
          difficultyLevel: "easy",
          distanceKm: 5.0,
          estimatedDuration: 60,
          isPmrAccessible: true,
          historicalTheme: "Test Theme",
          startingPointLat: 49.3394,
          startingPointLon: -0.8566,
        });

      const id = createResponse.body.id;

      return request(app.getHttpServer())
        .put(`/api/v1/parcours/${id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Updated Name",
          description: "Updated description",
        })
        .expect(200)
        .then((response) => {
          expect(response.body.name).toBe("Updated Name");
          expect(response.body.description).toBe("Updated description");
        });
    });
  });

  describe("/api/v1/parcours/:id (DELETE)", () => {
    it("should delete a parcours with authentication", async () => {
      // First create a parcours
      const createResponse = await request(app.getHttpServer())
        .post("/api/v1/parcours")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "To Be Deleted",
          description: "This will be deleted",
          difficultyLevel: "easy",
          distanceKm: 5.0,
          estimatedDuration: 60,
          isPmrAccessible: true,
          historicalTheme: "Test Theme",
          startingPointLat: 49.3394,
          startingPointLon: -0.8566,
        });

      const id = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/api/v1/parcours/${id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
