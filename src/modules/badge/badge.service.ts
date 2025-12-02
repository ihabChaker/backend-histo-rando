import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { CreateBadgeDto, UpdateBadgeDto } from './dto/badge.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BadgeService {
  constructor(
    @InjectModel(Badge)
    private badgeModel: typeof Badge,
    @InjectModel(UserBadge)
    private userBadgeModel: typeof UserBadge,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(createBadgeDto: CreateBadgeDto): Promise<Badge> {
    return this.badgeModel.create(createBadgeDto as any);
  }

  async findAll(): Promise<Badge[]> {
    return this.badgeModel.findAll({
      where: { isActive: true },
    });
  }

  async findOne(id: number): Promise<Badge> {
    const badge = await this.badgeModel.findByPk(id);
    if (!badge) {
      throw new NotFoundException(`Badge #${id} not found`);
    }
    return badge;
  }

  async update(id: number, updateBadgeDto: UpdateBadgeDto): Promise<Badge> {
    const badge = await this.findOne(id);
    await badge.update(updateBadgeDto);
    return badge;
  }

  async remove(id: number): Promise<void> {
    const badge = await this.findOne(id);
    await badge.destroy();
  }

  async findMyBadges(userId: number): Promise<UserBadge[]> {
    return this.userBadgeModel.findAll({
      where: { userId },
      include: [Badge],
    });
  }

  async awardBadge(userId: number, badgeId: number): Promise<UserBadge> {
    // Check if already awarded
    const existing = await this.userBadgeModel.findOne({
      where: { userId, badgeId },
    });
    if (existing) {
      return existing;
    }

    const badge = await this.findOne(badgeId);
    
    // Create user badge
    const userBadge = await this.userBadgeModel.create({
      userId,
      badgeId,
      earnedAt: new Date(),
      progress: 100,
    });

    // Award points to user?
    // Usually handled by the trigger of the badge, but we can do it here if needed.
    // For now, we assume points are added separately or this is just a record.
    
    return userBadge;
  }

  async getLeaderboard(period: string = 'all'): Promise<any[]> {
    // For now, we only support 'all' time based on totalPoints
    // In a real app, we would query a PointsHistory table for 'week', 'month', etc.
    
    const users = await this.userModel.findAll({
      order: [['totalPoints', 'DESC']],
      limit: 50,
      attributes: ['id', 'username', 'totalPoints', 'avatarUrl', 'firstName', 'lastName'],
    });

    // We need to count badges for each user
    // This is N+1 query, but for 50 users it's acceptable for now.
    // Better: use a subquery or join.
    
    const leaderboard = await Promise.all(users.map(async (user, index) => {
      const badgesCount = await this.userBadgeModel.count({
        where: { userId: user.id },
      });

      return {
        rank: index + 1,
        userId: user.id,
        username: user.username,
        points: user.totalPoints,
        level: Math.floor(user.totalPoints / 1000) + 1, // Simple level formula
        badgesCount,
        avatarUrl: user.avatarUrl,
      };
    }));

    return leaderboard;
  }
}
