import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  setupTestDatabase,
  syncDatabase,
  cleanDatabase,
  closeDatabase,
} from './helpers/database.helper';
import { createRegisterData, createParcoursData } from './factories';

describe('Quiz E2E Tests', () => {
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
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await closeDatabase();
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase();

    // Register user
    const registerData = createRegisterData();
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(registerData);
    authToken = registerResponse.body.access_token;

    // Create parcours
    const parcoursData = createParcoursData();
    const parcoursResponse = await request(app.getHttpServer())
      .post('/api/v1/parcours')
      .set('Authorization', `Bearer ${authToken}`)
      .send(parcoursData);
    parcoursId = parcoursResponse.body.id;
  });

  describe('POST /quizzes', () => {
    it('should create a new quiz', () => {
      return request(app.getHttpServer())
        .post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Quiz D-Day',
          description: 'Test your knowledge of D-Day',
          difficulty: 'medium',
          pointsReward: 50,
          isActive: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Quiz D-Day');
          expect(res.body.difficulty).toBe('medium');
          expect(res.body.pointsReward).toBe(50);
        });
    });

    it('should fail with invalid difficulty', () => {
      return request(app.getHttpServer())
        .post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Quiz',
          difficulty: 'invalid',
          pointsReward: 50,
        })
        .expect(400);
    });
  });

  describe('GET /quizzes', () => {
    it('should list all quizzes (public)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Quiz 1',
          difficulty: 'easy',
          pointsReward: 25,
        });

      await request(app.getHttpServer())
        .post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Quiz 2',
          difficulty: 'hard',
          pointsReward: 100,
        });

      return request(app.getHttpServer())
        .get('/api/v1/quizzes')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
        });
    });
  });

  describe('POST /quizzes/:id/questions', () => {
    it('should add question to quiz', async () => {
      const quizRes = await request(app.getHttpServer())
        .post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Quiz',
          difficulty: 'medium',
          pointsReward: 50,
        });

      return request(app.getHttpServer())
        .post(`/api/v1/quizzes/${quizRes.body.id}/questions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          questionText: 'When was D-Day?',
          correctAnswer: 'June 6, 1944',
          questionOrder: 1,
          points: 10,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.questionText).toBe('When was D-Day?');
          expect(res.body.quizId).toBe(quizRes.body.id);
        });
    });
  });

  describe('POST /quizzes/questions/:id/answers', () => {
    it('should add answers to question', async () => {
      const quizRes = await request(app.getHttpServer())
        .post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Quiz',
          difficulty: 'medium',
          pointsReward: 50,
        });

      const questionRes = await request(app.getHttpServer())
        .post(`/api/v1/quizzes/${quizRes.body.id}/questions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          questionText: 'Where did D-Day occur?',
          correctAnswer: 'Normandy',
          questionOrder: 1,
          points: 10,
        });

      return request(app.getHttpServer())
        .post(`/api/v1/quizzes/questions/${questionRes.body.id}/answers`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answerText: 'Normandy',
          isCorrect: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.answerText).toBe('Normandy');
          expect(res.body.isCorrect).toBe(true);
        });
    });
  });

  describe('POST /quizzes/attempts', () => {
    it('should submit quiz attempt with correct answers', async () => {
      // Create quiz
      const quizRes = await request(app.getHttpServer())
        .post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Quiz',
          difficulty: 'easy',
          pointsReward: 50,
        });

      // Create question
      const questionRes = await request(app.getHttpServer())
        .post(`/api/v1/quizzes/${quizRes.body.id}/questions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          questionText: 'Test Question?',
          correctAnswer: 'Answer',
          questionOrder: 1,
          points: 10,
        });

      // Create correct answer
      const answerRes = await request(app.getHttpServer())
        .post(`/api/v1/quizzes/questions/${questionRes.body.id}/answers`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answerText: 'Correct Answer',
          isCorrect: true,
        });

      // Submit attempt
      return request(app.getHttpServer())
        .post('/api/v1/quizzes/attempts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quizId: quizRes.body.id,
          answers: [
            {
              questionId: questionRes.body.id,
              answerId: answerRes.body.id,
            },
          ],
          timeTakenSeconds: 60,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.quizId).toBe(quizRes.body.id);
          expect(res.body.score).toBeGreaterThan(0);
          expect(res.body.isPassing).toBe(true);
        });
    });

    it('should fail quiz with incorrect answers', async () => {
      // Create quiz
      const quizRes = await request(app.getHttpServer())
        .post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Quiz',
          difficulty: 'easy',
          pointsReward: 50,
        });

      // Create question
      const questionRes = await request(app.getHttpServer())
        .post(`/api/v1/quizzes/${quizRes.body.id}/questions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          questionText: 'Test Question?',
          correctAnswer: 'Answer',
          questionOrder: 1,
          points: 10,
        });

      // Create wrong answer
      const wrongAnswerRes = await request(app.getHttpServer())
        .post(`/api/v1/quizzes/questions/${questionRes.body.id}/answers`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answerText: 'Wrong Answer',
          isCorrect: false,
        });

      // Submit attempt
      return request(app.getHttpServer())
        .post('/api/v1/quizzes/attempts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quizId: quizRes.body.id,
          answers: [
            {
              questionId: questionRes.body.id,
              answerId: wrongAnswerRes.body.id,
            },
          ],
          timeTakenSeconds: 30,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.score).toBe(0);
          expect(res.body.isPassing).toBe(false);
        });
    });
  });

  describe('GET /quizzes/attempts/me', () => {
    it('should list user quiz attempts', async () => {
      const quizRes = await request(app.getHttpServer())
        .post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Quiz',
          difficulty: 'easy',
          pointsReward: 50,
        });

      const questionRes = await request(app.getHttpServer())
        .post(`/api/v1/quizzes/${quizRes.body.id}/questions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          questionText: 'Test?',
          correctAnswer: 'Yes',
          questionOrder: 1,
          points: 10,
        });

      const answerRes = await request(app.getHttpServer())
        .post(`/api/v1/quizzes/questions/${questionRes.body.id}/answers`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answerText: 'Yes',
          isCorrect: true,
        });

      await request(app.getHttpServer())
        .post('/api/v1/quizzes/attempts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quizId: quizRes.body.id,
          answers: [
            { questionId: questionRes.body.id, answerId: answerRes.body.id },
          ],
          timeTakenSeconds: 45,
        });

      return request(app.getHttpServer())
        .get('/api/v1/quizzes/attempts/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);
        });
    });
  });

  describe('POST /quizzes/:id/parcours', () => {
    it('should associate quiz with parcours', async () => {
      const quizRes = await request(app.getHttpServer())
        .post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Quiz',
          difficulty: 'medium',
          pointsReward: 50,
        });

      return request(app.getHttpServer())
        .post(`/api/v1/quizzes/${quizRes.body.id}/parcours`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          unlockAtKm: 3.5,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.quizId).toBe(quizRes.body.id);
          expect(res.body.parcoursId).toBe(parcoursId);
          expect(parseFloat(res.body.unlockAtKm)).toBe(3.5);
        });
    });
  });

  describe('GET /quizzes/parcours/:parcoursId', () => {
    it('should get quizzes by parcours (public)', async () => {
      const quiz1 = await request(app.getHttpServer())
        .post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Quiz 1',
          difficulty: 'easy',
          pointsReward: 25,
        });

      await request(app.getHttpServer())
        .post(`/api/v1/quizzes/${quiz1.body.id}/parcours`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parcoursId: parcoursId,
          unlockAtKm: 1.0,
        });

      return request(app.getHttpServer())
        .get(`/api/v1/quizzes/parcours/${parcoursId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);
        });
    });
  });

  describe('DELETE /quizzes/:id', () => {
    it('should delete a quiz', async () => {
      const quizRes = await request(app.getHttpServer())
        .post('/api/v1/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'To Delete',
          difficulty: 'easy',
          pointsReward: 25,
        });

      return request(app.getHttpServer())
        .delete(`/api/v1/quizzes/${quizRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
