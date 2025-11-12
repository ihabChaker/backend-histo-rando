import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { HistoricalBattalion } from "./entities/historical-battalion.entity";
import { BattalionRoute } from "./entities/battalion-route.entity";
import { Parcours } from "@/modules/parcours/entities/parcours.entity";
import { HistoricalController } from "./historical.controller";
import { HistoricalService } from "./historical.service";

@Module({
  imports: [
    SequelizeModule.forFeature([HistoricalBattalion, BattalionRoute, Parcours]),
  ],
  controllers: [HistoricalController],
  providers: [HistoricalService],
  exports: [SequelizeModule, HistoricalService],
})
export class HistoricalModule {}
