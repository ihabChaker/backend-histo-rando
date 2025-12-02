import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User } from '../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const email = 'admin@historando.com';
  const password = 'adminpassword123';
  const username = 'admin';

  const userModel = app.get<typeof User>('UserRepository'); // This might fail if repository injection token is different
  // Actually, with SequelizeModule, we usually inject the model using @InjectModel(User)
  // But in a script, we can try to get the model from the module or just use the static methods if Sequelize is initialized.
  
  // Let's try to get the model via getModelToken if we knew it, but simpler is to use the User class directly if Sequelize is connected.
  // However, Sequelize needs to be initialized. Creating the app context does that.
  
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
