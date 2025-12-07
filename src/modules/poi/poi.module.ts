import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PoiService } from './poi.service';
import { PoiController } from './poi.controller';
import { PointOfInterest } from './entities/point-of-interest.entity';
import { UserPOIVisit } from '@/modules/activity/entities/user-poi-visit.entity';
import { User } from '@/modules/users/entities/user.entity';
import { ActiveParcoursSession } from '@/modules/parcours-session/entities/active-parcours-session.entity';
import { Quiz } from '@/modules/quiz/entities/quiz.entity';
import { Podcast } from '@/modules/media/entities/podcast.entity';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PointOfInterest,
      UserPOIVisit,
      User,
      ActiveParcoursSession,
      Quiz,
      Podcast,
    ]),
    FileUploadModule,
  ],
  controllers: [PoiController],
  providers: [PoiService],
  exports: [PoiService],
})
export class PoiModule {}
