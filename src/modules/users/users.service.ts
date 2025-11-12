import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./entities/user.entity";
import { UpdateUserProfileDto } from "./dto/user.dto";
import { UserActivity } from "@/modules/activity/entities/user-activity.entity";
import { UserPOIVisit } from "@/modules/activity/entities/user-poi-visit.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé");
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async updateProfile(
    userId: number,
    updateDto: UpdateUserProfileDto
  ): Promise<User> {
    const user = await this.findById(userId);

    await user.update(updateDto);

    return user;
  }

  async getUserStats(userId: number) {
    const user = await this.findById(userId);

    // Count related activities
    const totalParcours = await UserActivity.count({
      where: { userId },
      distinct: true,
      col: "parcoursId",
    });

    const totalPOIsVisited = await UserPOIVisit.count({
      where: { userId },
      distinct: true,
      col: "poiId",
    });

    return {
      totalPoints: user.totalPoints,
      totalKm: user.totalKm,
      username: user.username,
      isPmr: user.isPmr,
      totalParcours,
      totalPOIsVisited,
    };
  }

  async addPoints(userId: number, points: number): Promise<void> {
    const user = await this.findById(userId);
    user.totalPoints += points;
    await user.save();
  }

  async addKilometers(userId: number, km: number): Promise<void> {
    const user = await this.findById(userId);
    user.totalKm = Number(user.totalKm) + km;
    await user.save();
  }
}
