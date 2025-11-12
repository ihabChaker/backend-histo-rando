import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UserActivity } from "./entities/user-activity.entity";
import { UserPOIVisit } from "./entities/user-poi-visit.entity";
import { Parcours } from "@/modules/parcours/entities/parcours.entity";
import { PointOfInterest } from "@/modules/poi/entities/point-of-interest.entity";
import { User } from "@/modules/users/entities/user.entity";
import {
  CreateUserActivityDto,
  UpdateUserActivityDto,
  RecordPOIVisitDto,
} from "./dto/activity.dto";

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(UserActivity)
    private userActivityModel: typeof UserActivity,
    @InjectModel(UserPOIVisit)
    private userPOIVisitModel: typeof UserPOIVisit,
    @InjectModel(Parcours)
    private parcoursModel: typeof Parcours,
    @InjectModel(PointOfInterest)
    private poiModel: typeof PointOfInterest,
    @InjectModel(User)
    private userModel: typeof User
  ) {}

  async startActivity(
    userId: number,
    createDto: CreateUserActivityDto
  ): Promise<UserActivity> {
    // Verify parcours exists
    const parcours = await this.parcoursModel.findByPk(createDto.parcoursId);
    if (!parcours) {
      throw new NotFoundException(
        `Parcours with ID ${createDto.parcoursId} not found`
      );
    }

    return this.userActivityModel.create({
      userId,
      parcoursId: createDto.parcoursId,
      activityType: createDto.activityType || "walking",
      startDatetime: new Date(),
      status: "in_progress",
      distanceCoveredKm: 0,
      pointsEarned: 0,
    } as any);
  }

  async getUserActivities(userId: number): Promise<UserActivity[]> {
    return this.userActivityModel.findAll({
      where: { userId },
      include: [
        { model: Parcours },
        { model: UserPOIVisit, include: [PointOfInterest] },
      ],
      order: [["startDatetime", "DESC"]],
    });
  }

  async getActivity(id: number): Promise<UserActivity> {
    const activity = await this.userActivityModel.findByPk(id, {
      include: [
        { model: Parcours },
        { model: UserPOIVisit, include: [PointOfInterest] },
      ],
    });
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  async updateActivity(
    id: number,
    userId: number,
    updateDto: UpdateUserActivityDto
  ): Promise<UserActivity> {
    const activity = await this.getActivity(id);

    if (activity.userId !== userId) {
      throw new BadRequestException("You can only update your own activities");
    }

    // If completing the activity, update user stats
    if (updateDto.status === "completed" && activity.status !== "completed") {
      const user = await this.userModel.findByPk(userId);
      if (user && updateDto.pointsEarned) {
        await user.update({
          totalPoints: user.totalPoints + updateDto.pointsEarned,
          totalKm:
            parseFloat(user.totalKm.toString()) +
            (updateDto.distanceCoveredKm || 0),
        });
      }
    }

    await activity.update(updateDto);
    return activity;
  }

  async deleteActivity(id: number, userId: number): Promise<void> {
    const activity = await this.getActivity(id);

    if (activity.userId !== userId) {
      throw new BadRequestException("You can only delete your own activities");
    }

    await activity.destroy();
  }

  async recordPOIVisit(
    userId: number,
    dto: RecordPOIVisitDto
  ): Promise<UserPOIVisit> {
    // Verify activity exists and belongs to user (if activityId provided)
    if (dto.activityId) {
      const activity = await this.getActivity(dto.activityId);
      if (activity.userId !== userId) {
        throw new BadRequestException("Activity does not belong to you");
      }
    }

    // Verify POI exists
    const poi = await this.poiModel.findByPk(dto.poiId);
    if (!poi) {
      throw new NotFoundException(`POI with ID ${dto.poiId} not found`);
    }

    // Check if already visited
    const existingVisit = await this.userPOIVisitModel.findOne({
      where: {
        userId,
        poiId: dto.poiId,
        activityId: dto.activityId,
      },
    });

    if (existingVisit) {
      throw new ConflictException("POI already visited in this activity");
    }

    // Create visit
    const visit = await this.userPOIVisitModel.create({
      userId,
      poiId: dto.poiId,
      activityId: dto.activityId,
      visitDatetime: new Date(),
      scannedQr: dto.scannedQr || false,
      listenedAudio: dto.listenedAudio || false,
      pointsEarned: dto.pointsEarned || 0,
    } as any);

    // Update user total points if points earned
    if (dto.pointsEarned && dto.pointsEarned > 0) {
      const user = await this.userModel.findByPk(userId);
      if (user) {
        await user.update({
          totalPoints: user.totalPoints + dto.pointsEarned,
        });
      }
    }

    return visit;
  }

  async getUserPOIVisits(userId: number): Promise<UserPOIVisit[]> {
    return this.userPOIVisitModel.findAll({
      where: { userId },
      include: [PointOfInterest, UserActivity],
      order: [["visitDatetime", "DESC"]],
    });
  }

  async getActivityStats(userId: number): Promise<any> {
    const totalActivities = await this.userActivityModel.count({
      where: { userId },
    });

    const completedActivities = await this.userActivityModel.count({
      where: { userId, status: "completed" },
    });

    const totalDistance = await this.userActivityModel.sum(
      "distanceCoveredKm",
      {
        where: { userId, status: "completed" },
      }
    );

    const totalPoints = await this.userActivityModel.sum("pointsEarned", {
      where: { userId, status: "completed" },
    });

    const totalPOIVisits = await this.userPOIVisitModel.count({
      where: { userId },
    });

    return {
      totalActivities,
      completedActivities,
      totalDistance: totalDistance || 0,
      totalPoints: totalPoints || 0,
      totalPOIVisits,
    };
  }
}
