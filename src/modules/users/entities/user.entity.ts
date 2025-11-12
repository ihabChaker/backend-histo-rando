import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { UserActivity } from "@/modules/activity/entities/user-activity.entity";
import { UserPOIVisit } from "@/modules/activity/entities/user-poi-visit.entity";
import { UserQuizAttempt } from "@/modules/quiz/entities/user-quiz-attempt.entity";
import { UserChallengeProgress } from "@/modules/challenge/entities/user-challenge-progress.entity";
import { UserTreasureFound } from "@/modules/treasure-hunt/entities/user-treasure-found.entity";
import { UserRewardRedeemed } from "@/modules/reward/entities/user-reward-redeemed.entity";

@Table({
  tableName: "users",
  timestamps: true,
})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  username: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  passwordHash: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  firstName: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  lastName: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isPmr: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  totalPoints: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    get() {
      const value = this.getDataValue("totalKm");
      return value ? parseFloat(value.toString()) : 0;
    },
  })
  totalKm: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  avatarUrl: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  phoneNumber: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  registrationDate: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  updatedAt: Date;

  @HasMany(() => UserActivity)
  activities: UserActivity[];

  @HasMany(() => UserPOIVisit)
  poiVisits: UserPOIVisit[];

  @HasMany(() => UserQuizAttempt)
  quizAttempts: UserQuizAttempt[];

  @HasMany(() => UserChallengeProgress)
  challengeProgress: UserChallengeProgress[];

  @HasMany(() => UserTreasureFound)
  treasuresFound: UserTreasureFound[];

  @HasMany(() => UserRewardRedeemed)
  rewardsRedeemed: UserRewardRedeemed[];
}
