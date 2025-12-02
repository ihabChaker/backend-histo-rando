import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { BadgeService } from './badge.service';
import { BadgeController } from './badge.controller';
import { LeaderboardController } from './leaderboard.controller';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [SequelizeModule.forFeature([Badge, UserBadge, User]), AuthModule],
  controllers: [BadgeController, LeaderboardController],
  providers: [BadgeService],
  exports: [BadgeService],
})
export class BadgeModule {}
