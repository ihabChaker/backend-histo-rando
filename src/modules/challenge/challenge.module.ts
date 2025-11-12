import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Challenge } from './entities/challenge.entity';
import { UserChallengeProgress } from './entities/user-challenge-progress.entity';
import { UserActivity } from '@/modules/activity/entities/user-activity.entity';
import { User } from '@/modules/users/entities/user.entity';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Challenge,
      UserChallengeProgress,
      UserActivity,
      User,
    ]),
  ],
  controllers: [ChallengeController],
  providers: [ChallengeService],
  exports: [SequelizeModule, ChallengeService],
})
export class ChallengeModule {}
