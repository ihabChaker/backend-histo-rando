import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ParcoursModule } from './modules/parcours/parcours.module';
import { PoiModule } from './modules/poi/poi.module';
import { MediaModule } from './modules/media/media.module';
import { ActivityModule } from './modules/activity/activity.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { ChallengeModule } from './modules/challenge/challenge.module';
import { TreasureHuntModule } from './modules/treasure-hunt/treasure-hunt.module';
import { RewardModule } from './modules/reward/reward.module';
import { BadgeModule } from './modules/badge/badge.module';
import { HistoricalModule } from './modules/historical/historical.module';
import { HealthModule } from './modules/health/health.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ParcoursModule,
    PoiModule,
    MediaModule,
    ActivityModule,
    QuizModule,
    ChallengeModule,
    TreasureHuntModule,
    RewardModule,
    BadgeModule,
    HistoricalModule,
    AdminModule,
  ],
})
export class AppModule {}
