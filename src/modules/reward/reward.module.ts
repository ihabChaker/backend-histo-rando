import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Reward } from "./entities/reward.entity";
import { UserRewardRedeemed } from "./entities/user-reward-redeemed.entity";
import { User } from "@/modules/users/entities/user.entity";
import { RewardController } from "./reward.controller";
import { RewardService } from "./reward.service";

@Module({
  imports: [SequelizeModule.forFeature([Reward, UserRewardRedeemed, User])],
  controllers: [RewardController],
  providers: [RewardService],
  exports: [SequelizeModule, RewardService],
})
export class RewardModule {}
