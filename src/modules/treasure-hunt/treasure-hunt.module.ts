import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TreasureHunt } from './entities/treasure-hunt.entity';
import { UserTreasureFound } from './entities/user-treasure-found.entity';
import { TreasureItem } from './entities/treasure-item.entity';
import { UserTreasureItemFound } from './entities/user-treasure-item-found.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import { User } from '@/modules/users/entities/user.entity';
import { TreasureHuntController } from './treasure-hunt.controller';
import { TreasureHuntService } from './treasure-hunt.service';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      TreasureHunt,
      UserTreasureFound,
      TreasureItem,
      UserTreasureItemFound,
      Parcours,
      User,
    ]),
    FileUploadModule,
  ],
  controllers: [TreasureHuntController],
  providers: [TreasureHuntService],
  exports: [SequelizeModule, TreasureHuntService],
})
export class TreasureHuntModule {}
