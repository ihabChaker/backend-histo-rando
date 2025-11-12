import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TreasureHunt } from './entities/treasure-hunt.entity';
import { UserTreasureFound } from './entities/user-treasure-found.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import { User } from '@/modules/users/entities/user.entity';
import { TreasureHuntController } from './treasure-hunt.controller';
import { TreasureHuntService } from './treasure-hunt.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      TreasureHunt,
      UserTreasureFound,
      Parcours,
      User,
    ]),
  ],
  controllers: [TreasureHuntController],
  providers: [TreasureHuntService],
  exports: [SequelizeModule, TreasureHuntService],
})
export class TreasureHuntModule {}
