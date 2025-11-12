require('dotenv').config({ path: '.env.test' });
process.env.NODE_ENV = 'test';

const request = require('supertest');

async function test() {
  const { Test } = require('@nestjs/testing');
  const { AppModule } = require('./dist/app.module');
  
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send({
      email: 'test@example.com',
      username: 'testuser',
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
      isPmr: false,
    });

  console.log('Status:', response.status);
  console.log('Body:', JSON.stringify(response.body, null, 2));
  
  await app.close();
}

test().catch(console.error);
