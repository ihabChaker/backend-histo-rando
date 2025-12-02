import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from '../users/entities/user.entity';
import { Parcours } from '../parcours/entities/parcours.entity';
import { Reward } from '../reward/entities/reward.entity';
import { PointOfInterest } from '../poi/entities/point-of-interest.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { Challenge } from '../challenge/entities/challenge.entity';
import { TreasureHunt } from '../treasure-hunt/entities/treasure-hunt.entity';
import { UserActivity } from '../activity/entities/user-activity.entity';
import { UserPOIVisit } from '../activity/entities/user-poi-visit.entity';
import { UserQuizAttempt } from '../quiz/entities/user-quiz-attempt.entity';
import { UserChallengeProgress } from '../challenge/entities/user-challenge-progress.entity';
import { UserTreasureFound } from '../treasure-hunt/entities/user-treasure-found.entity';
import { UserRewardRedeemed } from '../reward/entities/user-reward-redeemed.entity';
import { Podcast } from '../media/entities/podcast.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Parcours) private parcoursModel: typeof Parcours,
    @InjectModel(Reward) private rewardModel: typeof Reward,
    @InjectModel(PointOfInterest) private poiModel: typeof PointOfInterest,
    @InjectModel(Quiz) private quizModel: typeof Quiz,
    @InjectModel(Challenge) private challengeModel: typeof Challenge,
    @InjectModel(TreasureHunt) private treasureHuntModel: typeof TreasureHunt,
    @InjectModel(Podcast) private podcastModel: typeof Podcast,
    @InjectModel(UserActivity) private userActivityModel: typeof UserActivity,
    @InjectModel(UserPOIVisit) private userPOIVisitModel: typeof UserPOIVisit,
    @InjectModel(UserQuizAttempt)
    private userQuizAttemptModel: typeof UserQuizAttempt,
    @InjectModel(UserChallengeProgress)
    private userChallengeProgressModel: typeof UserChallengeProgress,
    @InjectModel(UserTreasureFound)
    private userTreasureFoundModel: typeof UserTreasureFound,
    @InjectModel(UserRewardRedeemed)
    private userRewardRedeemedModel: typeof UserRewardRedeemed,
  ) {}

  async getDashboardStats() {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // User statistics
    const totalUsers = await this.userModel.count();
    const newUsersLast30Days = await this.userModel.count({
      where: { registrationDate: { [Op.gte]: last30Days } },
    });
    const newUsersLast7Days = await this.userModel.count({
      where: { registrationDate: { [Op.gte]: last7Days } },
    });
    const pmrUsers = await this.userModel.count({ where: { isPmr: true } });

    // Content statistics
    const totalParcours = await this.parcoursModel.count();
    const activeParcours = await this.parcoursModel.count({
      where: { isActive: true },
    });
    const totalPOIs = await this.poiModel.count();
    const totalQuizzes = await this.quizModel.count();
    const activeQuizzes = await this.quizModel.count({
      where: { isActive: true },
    });
    const totalChallenges = await this.challengeModel.count();
    const totalTreasures = await this.treasureHuntModel.count();
    const totalRewards = await this.rewardModel.count();
    const availableRewards = await this.rewardModel.count({
      where: { isAvailable: true },
    });
    const totalPodcasts = await this.podcastModel.count();

    // Activity statistics
    const totalActivities = await this.userActivityModel.count();
    const completedActivities = await this.userActivityModel.count({
      where: { isCompleted: true },
    });
    const activitiesLast30Days = await this.userActivityModel.count({
      where: { startTime: { [Op.gte]: last30Days } },
    });
    const totalPOIVisits = await this.userPOIVisitModel.count();
    const totalQuizAttempts = await this.userQuizAttemptModel.count();
    const passedQuizzes = await this.userQuizAttemptModel.count({
      where: { isPassing: true },
    });
    const totalChallengesCompleted = await this.userChallengeProgressModel.count(
      { where: { isCompleted: true } },
    );
    const totalTreasuresFound = await this.userTreasureFoundModel.count();
    const totalRewardsRedeemed = await this.userRewardRedeemedModel.count();

    // Calculate totals
    const totalPoints = await this.userModel.sum('totalPoints');
    const totalKm = await this.userModel.sum('totalKm');

    return {
      users: {
        total: totalUsers,
        newLast30Days: newUsersLast30Days,
        newLast7Days: newUsersLast7Days,
        pmrUsers,
        totalPoints: totalPoints || 0,
        totalKm: totalKm || 0,
      },
      content: {
        parcours: {
          total: totalParcours,
          active: activeParcours,
        },
        pois: totalPOIs,
        quizzes: {
          total: totalQuizzes,
          active: activeQuizzes,
        },
        challenges: totalChallenges,
        treasures: totalTreasures,
        rewards: {
          total: totalRewards,
          available: availableRewards,
        },
        podcasts: totalPodcasts,
      },
      activity: {
        totalActivities,
        completedActivities,
        activitiesLast30Days,
        completionRate:
          totalActivities > 0
            ? ((completedActivities / totalActivities) * 100).toFixed(2)
            : 0,
        poiVisits: totalPOIVisits,
        quizAttempts: totalQuizAttempts,
        quizPassRate:
          totalQuizAttempts > 0
            ? ((passedQuizzes / totalQuizAttempts) * 100).toFixed(2)
            : 0,
        challengesCompleted: totalChallengesCompleted,
        treasuresFound: totalTreasuresFound,
        rewardsRedeemed: totalRewardsRedeemed,
      },
    };
  }

  async getAllUsers(options?: {
    limit?: number;
    offset?: number;
    role?: string;
    isPmr?: boolean;
  }) {
    const where: any = {};
    if (options?.role) {
      where.role = options.role;
    }
    if (options?.isPmr !== undefined) {
      where.isPmr = options.isPmr;
    }

    const { count, rows } = await this.userModel.findAndCountAll({
      where,
      limit: options?.limit || 50,
      offset: options?.offset || 0,
      order: [['registrationDate', 'DESC']],
      attributes: {
        exclude: ['passwordHash'],
      },
    });

    return {
      total: count,
      users: rows,
      limit: options?.limit || 50,
      offset: options?.offset || 0,
    };
  }

  async getUserById(userId: number) {
    const user = await this.userModel.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
      include: [
        { model: UserActivity, limit: 10, order: [['startTime', 'DESC']] },
        { model: UserPOIVisit, limit: 10, order: [['visitDatetime', 'DESC']] },
        {
          model: UserQuizAttempt,
          limit: 10,
          order: [['attemptDate', 'DESC']],
        },
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async updateUserRole(userId: number, role: 'user' | 'admin') {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.role = role;
    await user.save();

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  async deleteUser(userId: number) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await user.destroy();
    return { message: 'User deleted successfully' };
  }

  async getRecentActivities(limit: number = 20) {
    const recentActivities = await this.userActivityModel.findAll({
      limit,
      order: [['startTime', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        },
        {
          model: Parcours,
          attributes: ['id', 'name', 'difficultyLevel'],
        },
      ],
    });

    return recentActivities;
  }

  async getContentStats() {
    const parcoursStats = await this.parcoursModel.findAll({
      attributes: ['difficultyLevel'],
      group: ['difficultyLevel'],
      raw: true,
    });

    const poiStats = await this.poiModel.findAll({
      attributes: ['poiType'],
      group: ['poiType'],
      raw: true,
    });

    return {
      parcoursByDifficulty: parcoursStats,
      poisByType: poiStats,
    };
  }

  async getUserGrowth(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await this.userModel.findAll({
      where: {
        registrationDate: { [Op.gte]: startDate },
      },
      attributes: ['registrationDate'],
      order: [['registrationDate', 'ASC']],
    });

    // Group by date
    const growthByDate: { [key: string]: number } = {};
    users.forEach((user) => {
      const date = user.registrationDate.toISOString().split('T')[0];
      growthByDate[date] = (growthByDate[date] || 0) + 1;
    });

    return Object.entries(growthByDate).map(([date, count]) => ({
      date,
      newUsers: count,
    }));
  }
}
