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
import { createRegisterData, createParcoursData } from "./factories";

describe("Media/Podcast E2E Tests", () => {
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
  });

  afterAll(async () => {
    await closeDatabase();
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase();
    // Register user and get token
    const registerData = createRegisterData();
    const registerResponse = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send(registerData);
    authToken = registerResponse.body.access_token;

    // Create test parcours
    const parcoursData = createParcoursData();
    const parcoursResponse = await request(app.getHttpServer())
      .post("/api/v1/parcours")
      .set("Authorization", `Bearer ${authToken}`)
      .send(parcoursData);
    parcoursId = parcoursResponse.body.id;
  });

  describe("POST /podcasts", () => {
    it("should create a new podcast", () => {
      return request(app.getHttpServer())
        .post("/api/v1/podcasts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Le Débarquement de Normandie",
          description: "Récit historique du D-Day",
          durationSeconds: 600,
          audioFileUrl: "https://example.com/podcasts/dday.mp3",
          narrator: "Jean Dupont",
          language: "fr",
          thumbnailUrl: "https://example.com/thumbnails/dday.jpg",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body.title).toBe("Le Débarquement de Normandie");
          expect(res.body.durationSeconds).toBe(600);
          expect(res.body.narrator).toBe("Jean Dupont");
          expect(res.body.language).toBe("fr");
        });
    });

    it("should fail without authentication", () => {
      return request(app.getHttpServer())
        .post("/api/v1/podcasts")
        .send({
          title: "Test Podcast",
          durationSeconds: 300,
          audioFileUrl: "https://example.com/test.mp3",
        })
        .expect(401);
    });

    it("should fail with invalid data", () => {
      return request(app.getHttpServer())
        .post("/api/v1/podcasts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "",
          durationSeconds: -100,
          audioFileUrl: "invalid-url",
        })
        .expect(400);
    });
  });

  describe("GET /podcasts", () => {
    it("should list all podcasts (public)", async () => {
      // Create test podcasts
      await request(app.getHttpServer())
        .post("/api/v1/podcasts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Podcast 1",
          durationSeconds: 300,
          audioFileUrl: "https://example.com/p1.mp3",
        });

      await request(app.getHttpServer())
        .post("/api/v1/podcasts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Podcast 2",
          durationSeconds: 400,
          audioFileUrl: "https://example.com/p2.mp3",
        });

      return request(app.getHttpServer())
        .get("/api/v1/podcasts")
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
        });
    });
  });

  describe("GET /podcasts/:id", () => {
    it("should get podcast by id (public)", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/api/v1/podcasts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Podcast",
          durationSeconds: 500,
          audioFileUrl: "https://example.com/test.mp3",
        });

      return request(app.getHttpServer())
        .get(`/api/v1/podcasts/${createRes.body.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createRes.body.id);
          expect(res.body.title).toBe("Test Podcast");
        });
    });

    it("should return 404 for non-existent podcast", () => {
      return request(app.getHttpServer())
        .get("/api/v1/podcasts/99999")
        .expect(404);
    });
  });

  describe("PUT /podcasts/:id", () => {
    it("should update a podcast", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/api/v1/podcasts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Original Title",
          durationSeconds: 300,
          audioFileUrl: "https://example.com/original.mp3",
        });

      return request(app.getHttpServer())
        .put(`/api/v1/podcasts/${createRes.body.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
          narrator: "New Narrator",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe("Updated Title");
          expect(res.body.narrator).toBe("New Narrator");
        });
    });
  });

  describe("DELETE /podcasts/:id", () => {
    it("should delete a podcast", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/api/v1/podcasts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "To Delete",
          durationSeconds: 200,
          audioFileUrl: "https://example.com/delete.mp3",
        });

      await request(app.getHttpServer())
        .delete(`/api/v1/podcasts/${createRes.body.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/api/v1/podcasts/${createRes.body.id}`)
        .expect(404);
    });
  });

  describe("POST /podcasts/:id/parcours", () => {
    it("should associate podcast with parcours", async () => {
      const podcastRes = await request(app.getHttpServer())
        .post("/api/v1/podcasts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Podcast",
          durationSeconds: 300,
          audioFileUrl: "https://example.com/test.mp3",
        });

      return request(app.getHttpServer())
        .post(`/api/v1/podcasts/${podcastRes.body.id}/parcours`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          playOrder: 1,
          suggestedKm: 2.5,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.podcastId).toBe(podcastRes.body.id);
          expect(res.body.parcoursId).toBe(parcoursId);
          expect(res.body.playOrder).toBe(1);
        });
    });

    it("should fail with non-existent parcours", async () => {
      const podcastRes = await request(app.getHttpServer())
        .post("/api/v1/podcasts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Podcast",
          durationSeconds: 300,
          audioFileUrl: "https://example.com/test.mp3",
        });

      return request(app.getHttpServer())
        .post(`/api/v1/podcasts/${podcastRes.body.id}/parcours`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          parcoursId: 99999,
          playOrder: 1,
        })
        .expect(404);
    });
  });

  describe("GET /podcasts/parcours/:parcoursId", () => {
    it("should get podcasts by parcours (public)", async () => {
      const podcast1 = await request(app.getHttpServer())
        .post("/api/v1/podcasts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Podcast 1",
          durationSeconds: 300,
          audioFileUrl: "https://example.com/p1.mp3",
        });

      const podcast2 = await request(app.getHttpServer())
        .post("/api/v1/podcasts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Podcast 2",
          durationSeconds: 400,
          audioFileUrl: "https://example.com/p2.mp3",
        });

      await request(app.getHttpServer())
        .post(`/api/v1/podcasts/${podcast1.body.id}/parcours`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ parcoursId, playOrder: 1, suggestedKm: 1.0 });

      await request(app.getHttpServer())
        .post(`/api/v1/podcasts/${podcast2.body.id}/parcours`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ parcoursId, playOrder: 2, suggestedKm: 3.0 });

      return request(app.getHttpServer())
        .get(`/api/v1/podcasts/parcours/${parcoursId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
        });
    });
  });

  describe("DELETE /podcasts/:podcastId/parcours/:parcoursId", () => {
    it("should dissociate podcast from parcours", async () => {
      const podcastRes = await request(app.getHttpServer())
        .post("/api/v1/podcasts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Podcast",
          durationSeconds: 300,
          audioFileUrl: "https://example.com/test.mp3",
        });

      await request(app.getHttpServer())
        .post(`/api/v1/podcasts/${podcastRes.body.id}/parcours`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ parcoursId, playOrder: 1 });

      return request(app.getHttpServer())
        .delete(`/api/v1/podcasts/${podcastRes.body.id}/parcours/${parcoursId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
