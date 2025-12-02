import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Challenge } from './entities/challenge.entity';
import { UserChallengeProgress } from './entities/user-challenge-progress.entity';
import { UserActivity } from '@/modules/activity/entities/user-activity.entity';
import { User } from '@/modules/users/entities/user.entity';
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  StartChallengeDto,
  CompleteChallengeDto,
} from './dto/challenge.dto';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(Challenge) private challengeModel: typeof Challenge,
    @InjectModel(UserChallengeProgress)
    private progressModel: typeof UserChallengeProgress,
    @InjectModel(UserActivity) private activityModel: typeof UserActivity,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async createChallenge(createDto: CreateChallengeDto): Promise<Challenge> {
    return this.challengeModel.create(createDto as any);
  }

  async findAllChallenges(): Promise<Challenge[]> {
    return this.challengeModel.findAll({
      where: { isActive: true },
      order: [['pointsReward', 'DESC']],
    });
  }

  async findOneChallenge(id: number): Promise<Challenge> {
    const challenge = await this.challengeModel.findByPk(id);
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }
    return challenge;
  }

  async updateChallenge(
    id: number,
    updateDto: UpdateChallengeDto,
  ): Promise<Challenge> {
    const challenge = await this.findOneChallenge(id);
    await challenge.update(updateDto);
    return challenge;
  }

  async removeChallenge(id: number): Promise<void> {
    const challenge = await this.findOneChallenge(id);
    await challenge.destroy();
  }

  async startChallenge(
    userId: number,
    dto: StartChallengeDto,
  ): Promise<UserChallengeProgress> {
    // Verify challenge exists (throws if not found)
    await this.findOneChallenge(dto.challengeId);
    
    if (dto.activityId) {
      const activity = await this.activityModel.findByPk(dto.activityId);

      if (!activity) {
        throw new NotFoundException(
          `Activity with ID ${dto.activityId} not found`,
        );
      }

      if (activity.userId !== userId) {
        throw new BadRequestException('Activity does not belong to you');
      }
    }

    return this.progressModel.create({
      userId,
      challengeId: dto.challengeId,
      activityId: dto.activityId || null,
      startDatetime: new Date(),
      status: 'started',
      pointsEarned: 0,
    } as any);
  }

  async completeChallenge(
    progressId: number,
    userId: number,
    dto: CompleteChallengeDto,
  ): Promise<UserChallengeProgress> {
    const progress = await this.progressModel.findByPk(progressId);

    if (!progress) {
      throw new NotFoundException(
        `Challenge progress with ID ${progressId} not found`,
      );
    }

    if (progress.userId !== userId) {
      throw new BadRequestException(
        'Challenge progress does not belong to you',
      );
    }

    await progress.update({
      completionDatetime: new Date(),
      status: dto.status,
      pointsEarned: dto.pointsEarned,
    });

    if (dto.status === 'completed' && dto.pointsEarned > 0) {
      const user = await this.userModel.findByPk(userId);
      if (user) {
        await user.update({
          totalPoints: user.totalPoints + dto.pointsEarned,
        });
      }
    }

    return progress;
  }

  async getUserChallengeProgress(
    userId: number,
  ): Promise<UserChallengeProgress[]> {
    return this.progressModel.findAll({
      where: { userId },
      include: [Challenge, UserActivity],
      order: [['startDatetime', 'DESC']],
    });
  }
}
