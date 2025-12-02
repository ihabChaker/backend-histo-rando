import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User } from '../modules/users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('Syncing User model...');
    await User.sync({ alter: true });
    console.log('User model synced successfully.');
  } catch (error) {
    console.error('Error syncing User model:', error);
  }

  await app.close();
}

bootstrap();
