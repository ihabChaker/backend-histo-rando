import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS - support multiple origins
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : '*';

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipes
  // Use ZodValidationPipe for Zod schemas (must come first)
  app.useGlobalPipes(new ZodValidationPipe());
  // Use ValidationPipe ONLY for query params transformation (not body validation)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enables automatic type conversion for query params
      transformOptions: {
        enableImplicitConversion: true, // Converts query params to correct types
      },
      // Don't validate body - let Zod handle it
      skipMissingProperties: true,
      whitelist: false, // Don't strip properties - Zod will validate
      forbidNonWhitelisted: false,
    }),
  );

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
    .addTag('admin', 'Administration et tableau de bord')
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
  app.getHttpAdapter().get('/api-json', (req: any, res: any) => {
    res.status(200).send(document);
  });

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 HistoRando API is running on: http://0.0.0.0:${port}`);
  console.log(
    `📚 Swagger docs available at: http://0.0.0.0:${port}/${process.env.SWAGGER_PATH || 'api/docs'}`,
  );
}

bootstrap();
