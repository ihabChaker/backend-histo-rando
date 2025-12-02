import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Parcours } from '../parcours/entities/parcours.entity';
import { Reward } from '../reward/entities/reward.entity';
import { PointOfInterest } from '../poi/entities/point-of-interest.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { Challenge } from '../challenge/entities/challenge.entity';
import { TreasureHunt } from '../treasure-hunt/entities/treasure-hunt.entity';
import { UserActivity } from '../activity/entities/user-activity.entity';
import { UserPOIVisit } from '../activity/entities/user-poi-visit.entity';
import { UserQuizAttempt } from '../quiz/entities/user-quiz-attempt.entity';
import { UserChallengeProgress } from '../challenge/entities/user-challenge-progress.entity';
import { UserTreasureFound } from '../treasure-hunt/entities/user-treasure-found.entity';
import { UserRewardRedeemed } from '../reward/entities/user-reward-redeemed.entity';
import { Podcast } from '../media/entities/podcast.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Parcours,
      Reward,
      PointOfInterest,
      Quiz,
      Challenge,
      TreasureHunt,
      UserActivity,
      UserPOIVisit,
      UserQuizAttempt,
      UserChallengeProgress,
      UserTreasureFound,
      UserRewardRedeemed,
      Podcast,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
