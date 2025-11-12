import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserActivity } from './entities/user-activity.entity';
import { UserPOIVisit } from './entities/user-poi-visit.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import { PointOfInterest } from '@/modules/poi/entities/point-of-interest.entity';
import { User } from '@/modules/users/entities/user.entity';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserActivity,
      UserPOIVisit,
      Parcours,
      PointOfInterest,
      User,
    ]),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [SequelizeModule, ActivityService],
})
export class ActivityModule {}
