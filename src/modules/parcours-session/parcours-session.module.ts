import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActiveParcoursSession } from './entities/active-parcours-session.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import { User } from '@/modules/users/entities/user.entity';
import { UserActivity } from '@/modules/activity/entities/user-activity.entity';
import { ParcoursSessionController } from './parcours-session.controller';
import { ParcoursSessionService } from './parcours-session.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ActiveParcoursSession,
      Parcours,
      User,
      UserActivity,
    ]),
  ],
  controllers: [ParcoursSessionController],
  providers: [ParcoursSessionService],
  exports: [ParcoursSessionService],
})
export class ParcoursSessionModule {}
