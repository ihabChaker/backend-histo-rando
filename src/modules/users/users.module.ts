import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserActivity } from '@/modules/activity/entities/user-activity.entity';
import { UserPOIVisit } from '@/modules/activity/entities/user-poi-visit.entity';

@Module({
  imports: [SequelizeModule.forFeature([User, UserActivity, UserPOIVisit])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
