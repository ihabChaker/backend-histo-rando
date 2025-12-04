import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  PaginationDto,
  PaginatedResponse,
  createPaginatedResponse,
} from '@/common/dto/pagination.dto';
import { Reward } from './entities/reward.entity';
import { UserRewardRedeemed } from './entities/user-reward-redeemed.entity';
import { User } from '@/modules/users/entities/user.entity';
import {
  CreateRewardDto,
  UpdateRewardDto,
  RedeemRewardDto,
} from './dto/reward.dto';

@Injectable()
export class RewardService {
  constructor(
    @InjectModel(Reward) private rewardModel: typeof Reward,
    @InjectModel(UserRewardRedeemed)
    private redeemedModel: typeof UserRewardRedeemed,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  private generateRedemptionCode(): string {
    return `RWD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  async createReward(createDto: CreateRewardDto): Promise<Reward> {
    return this.rewardModel.create(createDto as any);
  }

  async findAllRewards(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<Reward>> {
    const { rows, count } = await this.rewardModel.findAndCountAll({
      where: { isAvailable: true },
      order: [['pointsCost', 'ASC']],
      limit: pagination.take,
      offset: pagination.skip,
    });
    return createPaginatedResponse(rows, count, pagination);
  }

  async findOneReward(id: number): Promise<Reward> {
    const reward = await this.rewardModel.findByPk(id);
    if (!reward) {
      throw new NotFoundException(`Reward with ID ${id} not found`);
    }
    return reward;
  }

  async updateReward(id: number, updateDto: UpdateRewardDto): Promise<Reward> {
    const reward = await this.findOneReward(id);
    await reward.update(updateDto);
    return reward;
  }

  async removeReward(id: number): Promise<void> {
    const reward = await this.findOneReward(id);
    await reward.destroy();
  }

  async redeemReward(userId: number, dto: RedeemRewardDto): Promise<any> {
    const reward = await this.findOneReward(dto.rewardId);
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if reward is available
    if (!reward.isAvailable) {
      throw new BadRequestException('Reward is not available');
    }

    // Check stock
    if (reward.stockQuantity <= 0) {
      throw new BadRequestException('Reward is out of stock');
    }

    // Check if user has enough points
    if (user.totalPoints < reward.pointsCost) {
      throw new BadRequestException(
        `Insufficient points. You have ${user.totalPoints} points, need ${reward.pointsCost}`,
      );
    }

    // Create redemption
    const redemption = await this.redeemedModel.create({
      userId,
      rewardId: dto.rewardId,
      redemptionDatetime: new Date(),
      pointsSpent: reward.pointsCost,
      status: 'pending',
      redemptionCode: this.generateRedemptionCode(),
    } as any);

    // Deduct points and stock
    await user.update({
      totalPoints: user.totalPoints - reward.pointsCost,
    });

    await reward.update({
      stockQuantity: reward.stockQuantity - 1,
    });

    return {
      rewardId: dto.rewardId,
      redemptionCode: redemption.redemptionCode,
      status: redemption.status,
      redemption,
      message: 'Reward redeemed successfully',
    };
  }

  async getUserRedemptions(
    userId: number,
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<UserRewardRedeemed>> {
    const { rows, count } = await this.redeemedModel.findAndCountAll({
      where: { userId },
      include: [Reward],
      order: [['redemptionDatetime', 'DESC']],
      limit: pagination.take,
      offset: pagination.skip,
    });
    return createPaginatedResponse(rows, count, pagination);
  }

  async updateRedemptionStatus(
    redemptionId: number,
    status: 'pending' | 'redeemed' | 'used',
  ): Promise<UserRewardRedeemed> {
    const redemption = await this.redeemedModel.findByPk(redemptionId);
    if (!redemption) {
      throw new NotFoundException('Redemption not found');
    }

    await redemption.update({ status });
    return redemption;
  }
}
