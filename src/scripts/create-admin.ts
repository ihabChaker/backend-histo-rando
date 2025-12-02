import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User } from '../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const email = 'admin@historando.com';
  const password = 'adminpassword123';
  const username = 'admin';

  // Using the `User` model statically after the Nest app context initializes.

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('Admin user already exists.');
      await app.close();
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await User.create({
      email,
      username,
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isPmr: false,
    });

    console.log('Admin user created successfully:', admin.toJSON());
  } catch (error) {
    console.error('Error creating admin user:', error);
  }

  await app.close();
}

bootstrap();
