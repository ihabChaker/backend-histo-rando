import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Podcast } from "./entities/podcast.entity";
import { ParcoursPodcast } from "@/modules/parcours/entities/parcours-podcast.entity";
import { Parcours } from "@/modules/parcours/entities/parcours.entity";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";

@Module({
  imports: [SequelizeModule.forFeature([Podcast, ParcoursPodcast, Parcours])],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [SequelizeModule, MediaService],
})
export class MediaModule {}
