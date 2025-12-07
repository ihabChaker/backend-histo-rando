import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ActiveParcoursSession } from './entities/active-parcours-session.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import { User } from '@/modules/users/entities/user.entity';
import { UserActivity } from '@/modules/activity/entities/user-activity.entity';
import {
  StartSessionDto,
  UpdateSessionDto,
  CompleteSessionDto,
} from './dto/session.dto';

@Injectable()
export class ParcoursSessionService {
  constructor(
    @InjectModel(ActiveParcoursSession)
    private sessionModel: typeof ActiveParcoursSession,
    @InjectModel(Parcours)
    private parcoursModel: typeof Parcours,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserActivity)
    private activityModel: typeof UserActivity,
  ) {}

  async startSession(
    userId: number,
    dto: StartSessionDto,
  ): Promise<ActiveParcoursSession> {
    console.log(
      '🚀 Starting session for userId:',
      userId,
      'parcoursId:',
      dto.parcoursId,
    );

    // Check if user exists
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      throw new NotFoundException(
        `User with ID ${userId} not found. Please ensure you are logged in with a valid account.`,
      );
    }
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      username: user.username,
    });

    // Check if parcours exists
    const parcours = await this.parcoursModel.findByPk(dto.parcoursId);
    if (!parcours) {
      console.error('❌ Parcours not found:', dto.parcoursId);
      throw new NotFoundException(
        `Parcours with ID ${dto.parcoursId} not found`,
      );
    }
    console.log('✅ Parcours found:', {
      id: parcours.id,
      name: parcours.name,
    });

    // Check for existing active session on this parcours
    const existingSession = await this.sessionModel.findOne({
      where: {
        userId,
        parcoursId: dto.parcoursId,
        isCompleted: false,
      },
    });

    if (existingSession) {
      // Resume existing session
      return existingSession;
    }

    // Create new session
    return this.sessionModel.create({
      userId,
      parcoursId: dto.parcoursId,
      startTime: new Date(),
      lastUpdateTime: new Date(),
      currentLatitude: dto.startLat,
      currentLongitude: dto.startLon,
      distanceCovered: 0,
      poisVisitedIds: '[]',
      isCompleted: false,
      completionBonus: 50,
    } as any);
  }

  async getActiveSession(
    userId: number,
    parcoursId: number,
  ): Promise<ActiveParcoursSession | null> {
    return this.sessionModel.findOne({
      where: {
        userId,
        parcoursId,
        isCompleted: false,
      },
      include: [Parcours],
    });
  }

  async getAllActiveSessions(userId: number): Promise<ActiveParcoursSession[]> {
    return this.sessionModel.findAll({
      where: {
        userId,
        isCompleted: false,
      },
      include: [Parcours],
      order: [['lastUpdateTime', 'DESC']],
    });
  }

  async updateSession(
    sessionId: number,
    userId: number,
    dto: UpdateSessionDto,
  ): Promise<ActiveParcoursSession> {
    const session = await this.sessionModel.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.isCompleted) {
      throw new BadRequestException('Cannot update a completed session');
    }

    await session.update({
      currentLatitude: dto.currentLat,
      currentLongitude: dto.currentLon,
      distanceCovered: dto.distanceCovered ?? session.distanceCovered,
      lastUpdateTime: new Date(),
    });

    return session;
  }

  async completeSession(
    sessionId: number,
    userId: number,
    dto: CompleteSessionDto,
  ): Promise<any> {
    const session = await this.sessionModel.findOne({
      where: { id: sessionId, userId },
      include: [Parcours],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.isCompleted) {
      throw new BadRequestException('Session already completed');
    }

    // Mark as completed
    await session.update({
      isCompleted: true,
      completedAt: new Date(),
      currentLatitude: dto.finalLat,
      currentLongitude: dto.finalLon,
      distanceCovered: dto.distanceCovered,
    });

    // Award completion bonus
    const user = await this.userModel.findByPk(userId);
    if (user && session.completionBonus > 0) {
      await user.update({
        totalPoints: (user.totalPoints || 0) + session.completionBonus,
      });
    }

    // Create activity record
    await this.activityModel.create({
      userId,
      parcoursId: session.parcoursId,
      startDatetime: session.startTime,
      endDatetime: new Date(),
      activityType: 'walking', // Default to walking for completed parcours
      status: 'completed',
      pointsEarned: session.completionBonus,
      distanceCoveredKm: dto.distanceCovered / 1000, // Convert meters to km
    } as any);

    return {
      session: session.toJSON(),
      pointsEarned: session.completionBonus,
      message: 'Félicitations! Parcours terminé!',
    };
  }

  async deleteSession(sessionId: number, userId: number): Promise<void> {
    const session = await this.sessionModel.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await session.destroy();
  }

  async addPOIVisit(sessionId: number, poiId: number): Promise<void> {
    const session = await this.sessionModel.findByPk(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const visitedPOIs = session.getPoisVisited();
    if (!visitedPOIs.includes(poiId)) {
      visitedPOIs.push(poiId);
      session.setPoisVisited(visitedPOIs);
      await session.save();
    }
  }
}
