import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe - use ZodValidationPipe for Zod schemas
  app.useGlobalPipes(new ZodValidationPipe());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('HistoRando API')
    .setDescription(
      'API Backend pour HistoRando - Randonnées historiques en Normandie. ' +
        "Cette API permet de gérer les parcours, points d'intérêt, activités utilisateur, " +
        'quizzes, challenges, chasses aux trésors et récompenses.',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentification et autorisation')
    .addTag('users', 'Gestion des profils utilisateurs')
    .addTag('parcours', 'Gestion des parcours de randonnée')
    .addTag('poi', "Points d'intérêt historiques")
    .addTag('media', 'Gestion des médias (podcasts, images)')
    .addTag('activities', 'Suivi des activités utilisateur')
    .addTag('quiz', 'Quizzes et questions')
    .addTag('challenges', 'Défis physiques')
    .addTag('treasure-hunt', 'Chasse aux trésors')
    .addTag('rewards', 'Système de récompenses')
    .addTag('historical', 'Données historiques (bataillons)')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  if (process.env.SWAGGER_ENABLED === 'true') {
    SwaggerModule.setup(process.env.SWAGGER_PATH || 'api/docs', app, document);
  }

  // Expose OpenAPI JSON endpoint for Postman import
  app.getHttpAdapter().get('/api-json', (req, res) => {
    res.json(document);
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 HistoRando API is running on: http://localhost:${port}`);
  console.log(
    `📚 Swagger docs available at: http://localhost:${port}/${process.env.SWAGGER_PATH || 'api/docs'}`,
  );
}

bootstrap();
