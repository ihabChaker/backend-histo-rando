import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PoiService } from './poi.service';
import { PoiController } from './poi.controller';
import { PointOfInterest } from './entities/point-of-interest.entity';

@Module({
  imports: [SequelizeModule.forFeature([PointOfInterest])],
  controllers: [PoiController],
  providers: [PoiService],
  exports: [PoiService],
})
export class PoiModule {}
