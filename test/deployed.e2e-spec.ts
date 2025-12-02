import request from 'supertest';

describe('Deployed API E2E Tests (DigitalOcean)', () => {
  const baseURL = 'https://histo-rando-backend-egvh3.ondigitalocean.app';
  let authToken: string;
  let userId: number;
  const testEmail = `test-${Date.now()}@example.com`;
  const testUsername = `testuser-${Date.now()}`;
  const testPassword = 'Test123!';

  describe('Health Checks', () => {
    it('/api/v1/health (GET) - should return ok status', () => {
      return request(baseURL)
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.environment).toBe('production');
          expect(res.body.uptime).toBeGreaterThan(0);
        });
    });

    it('/api/v1/health/ready (GET) - should return ready status', () => {
      return request(baseURL)
        .get('/api/v1/health/ready')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ready');
        });
    });

    it('/api/v1/health/live (GET) - should return alive status', () => {
      return request(baseURL)
        .get('/api/v1/health/live')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('alive');
        });
    });
  });

  describe('Authentication', () => {
    it('/api/v1/auth/register (POST) - should register a new user', () => {
      return request(baseURL)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          username: testUsername,
          password: testPassword,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user).toBeDefined();
          expect(res.body.user.email).toBe(testEmail);
          expect(res.body.user.username).toBe(testUsername);
          authToken = res.body.access_token;
          userId = res.body.user.id;
        });
    });

    it('/api/v1/auth/login (POST) - should login with credentials', () => {
      return request(baseURL)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user).toBeDefined();
          expect(res.body.user.email).toBe(testEmail);
        });
    });

    it('/api/v1/auth/login (POST) - should fail with wrong password', () => {
      return request(baseURL)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword!',
        })
        .expect(401);
    });
  });

  describe('User Profile', () => {
    it('/api/v1/users/me (GET) - should get current user profile', () => {
      return request(baseURL)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.email).toBe(testEmail);
          expect(res.body.username).toBe(testUsername);
          expect(res.body.totalPoints).toBe(0);
          expect(res.body.totalKm).toBe(0);
        });
    });

    it('/api/v1/users/me (PUT) - should update user profile', () => {
      return request(baseURL)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.firstName).toBe('John');
          expect(res.body.lastName).toBe('Doe');
        });
    });

    it('/api/v1/users/me (GET) - should fail without auth token', () => {
      return request(baseURL).get('/api/v1/users/me').expect(401);
    });
  });

  describe('Parcours', () => {
    it('/api/v1/parcours (GET) - should return empty parcours list', () => {
      return request(baseURL)
        .get('/api/v1/parcours')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('API Documentation', () => {
    it('/api/docs (GET) - should serve Swagger documentation', () => {
      return request(baseURL).get('/api/docs').expect(200);
    });

    it('/api-json (GET) - should return OpenAPI JSON', () => {
      return request(baseURL)
        .get('/api-json')
        .expect(200)
        .expect((res) => {
          expect(res.body.openapi).toBeDefined();
          expect(res.body.info).toBeDefined();
          expect(res.body.info.title).toBe('HistoRando API');
        });
    });
  });

  describe('CORS', () => {
    it('should have CORS enabled', () => {
      return request(baseURL)
        .options('/api/v1/health')
        .set('Origin', 'http://localhost:3001')
        .expect((res) => {
          expect(
            res.headers['access-control-allow-origin'] ||
              res.status === 204 ||
              res.status === 200,
          ).toBeTruthy();
        });
    });
  });
});
