import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '@/modules/users/entities/user.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import { PointOfInterest } from '@/modules/poi/entities/point-of-interest.entity';
import { Podcast } from '@/modules/media/entities/podcast.entity';
import { Quiz } from '@/modules/quiz/entities/quiz.entity';
import { Question } from '@/modules/quiz/entities/question.entity';
import { Answer } from '@/modules/quiz/entities/answer.entity';
import { Challenge } from '@/modules/challenge/entities/challenge.entity';
import { TreasureHunt } from '@/modules/treasure-hunt/entities/treasure-hunt.entity';
import { Reward } from '@/modules/reward/entities/reward.entity';
import { UserActivity } from '@/modules/activity/entities/user-activity.entity';
import { UserPOIVisit } from '@/modules/activity/entities/user-poi-visit.entity';
import { UserQuizAttempt } from '@/modules/quiz/entities/user-quiz-attempt.entity';
import { UserChallengeProgress } from '@/modules/challenge/entities/user-challenge-progress.entity';
import { UserTreasureFound } from '@/modules/treasure-hunt/entities/user-treasure-found.entity';
import { UserRewardRedeemed } from '@/modules/reward/entities/user-reward-redeemed.entity';
import { ParcoursPodcast } from '@/modules/parcours/entities/parcours-podcast.entity';
import { ParcoursQuiz } from '@/modules/parcours/entities/parcours-quiz.entity';
import { HistoricalBattalion } from '@/modules/historical/entities/historical-battalion.entity';
import { BattalionRoute } from '@/modules/historical/entities/battalion-route.entity';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const host = configService.get('database.host');
        const port = configService.get('database.port');
        const username = configService.get('database.username');
        const password = String(configService.get('database.password'));
        const database = configService.get('database.database');

        console.log('🔍 Database config:', {
          host,
          port,
          username,
          password: password?.substring(0, 4) + '***',
          passwordType: typeof password,
          database,
        });

        return {
          dialect: 'postgres',
          host,
          port,
          username,
          password,
          database,
          models: [
            User,
            Parcours,
            PointOfInterest,
            Podcast,
            Quiz,
            Question,
            Answer,
            Challenge,
            TreasureHunt,
            Reward,
            UserActivity,
            UserPOIVisit,
            UserQuizAttempt,
            UserChallengeProgress,
            UserTreasureFound,
            UserRewardRedeemed,
            ParcoursPodcast,
            ParcoursQuiz,
            HistoricalBattalion,
            BattalionRoute,
          ],
          autoLoadModels: true,
          synchronize: false, // Use migrations in production
          logging: configService.get('database.logging') ? console.log : false,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
