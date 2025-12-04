import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ParcoursService } from './parcours.service';
import { ParcoursController } from './parcours.controller';
import { Parcours } from './entities/parcours.entity';
import { ParcoursPodcast } from './entities/parcours-podcast.entity';
import { ParcoursQuiz } from './entities/parcours-quiz.entity';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Parcours, ParcoursPodcast, ParcoursQuiz]),
    FileUploadModule,
  ],
  controllers: [ParcoursController],
  providers: [ParcoursService],
  exports: [ParcoursService],
})
export class ParcoursModule {}
