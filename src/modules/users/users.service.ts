import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UpdateUserProfileDto, AdminUpdateUserDto } from './dto/user.dto';
import { UserActivity } from '@/modules/activity/entities/user-activity.entity';
import { UserPOIVisit } from '@/modules/activity/entities/user-poi-visit.entity';
import { PaginationDto, PaginatedResponse } from '@/common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserActivity)
    private userActivityModel: typeof UserActivity,
    @InjectModel(UserPOIVisit)
    private userPOIVisitModel: typeof UserPOIVisit,
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async findAll(
    paginationDto: PaginationDto = new PaginationDto(),
  ): Promise<PaginatedResponse<User>> {
    const { skip, take, page = 1, limit = 10 } = paginationDto;

    const { count, rows } = await this.userModel.findAndCountAll({
      offset: skip,
      limit: take,
      order: [['id', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit);

    return {
      data: rows,
      meta: {
        page,
        limit,
        total: count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async updateProfile(
    userId: number,
    updateDto: UpdateUserProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    await user.update(updateDto);

    return user;
  }

  async adminUpdateUser(
    userId: number,
    updateDto: AdminUpdateUserDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    await user.update(updateDto);
    return user;
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.findById(userId);
    await user.destroy();
  }

  async getUserStats(userId: number) {
    const user = await this.findById(userId);

    // Count related activities
    const totalParcours = await this.userActivityModel.count({
      where: { userId },
      distinct: true,
      col: 'parcoursId',
    });

    const totalPOIsVisited = await this.userPOIVisitModel.count({
      where: { userId },
      distinct: true,
      col: 'poiId',
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
