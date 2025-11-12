import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Authentication E2E Tests", () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ZodValidationPipe());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/api/v1/auth/register (POST)", () => {
    it("should register a new user successfully", () => {
      const timestamp = Date.now();
      return request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          email: `testuser${timestamp}@example.com`,
          username: `testuser${timestamp}`,
          password: "SecurePassword123!",
          firstName: "Test",
          lastName: "User",
          isPmr: false,
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty("access_token");
          expect(response.body).toHaveProperty("user");
          expect(response.body.user).toHaveProperty("id");
          expect(response.body.user.email).toBe(
            `testuser${timestamp}@example.com`
          );
          expect(response.body.user.username).toBe(`testuser${timestamp}`);

          authToken = response.body.access_token;
          userId = response.body.user.id;
        });
    });

    it("should fail to register with existing email", () => {
      const timestamp = Date.now();
      const duplicateEmail = `duplicate${timestamp}@example.com`;

      // First registration
      return request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          email: duplicateEmail,
          username: `user${timestamp}`,
          password: "SecurePassword123!",
          firstName: "Test",
          lastName: "User",
          isPmr: false,
        })
        .expect(201)
        .then(() => {
          // Second registration with same email
          return request(app.getHttpServer())
            .post("/api/v1/auth/register")
            .send({
              email: duplicateEmail,
              username: `anotheruser${timestamp}`,
              password: "SecurePassword123!",
              firstName: "Test",
              lastName: "User",
              isPmr: false,
            })
            .expect(409);
        });
    });

    it("should fail to register with invalid email", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          email: "invalid-email",
          username: "testuser",
          password: "SecurePassword123!",
          firstName: "Test",
          lastName: "User",
          isPmr: false,
        })
        .expect(400);
    });
  });

  describe("/api/v1/auth/login (POST)", () => {
    const testEmail = `logintest${Date.now()}@example.com`;
    const testPassword = "SecurePassword123!";

    beforeAll(async () => {
      // Create a user for login tests
      await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          email: testEmail,
          username: `logintest${Date.now()}`,
          password: testPassword,
          firstName: "Login",
          lastName: "Test",
          isPmr: false,
        });
    });

    it("should login successfully with correct credentials", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty("access_token");
          expect(response.body).toHaveProperty("user");
          expect(response.body.user.email).toBe(testEmail);
        });
    });

    it("should fail to login with incorrect password", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: testEmail,
          password: "WrongPassword123!",
        })
        .expect(401);
    });

    it("should fail to login with non-existent email", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "SomePassword123!",
        })
        .expect(401);
    });
  });
});
