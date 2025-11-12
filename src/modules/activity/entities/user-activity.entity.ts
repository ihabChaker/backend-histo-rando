import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from '@/modules/users/entities/user.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import { UserPOIVisit } from './user-poi-visit.entity';
import { UserChallengeProgress } from '@/modules/challenge/entities/user-challenge-progress.entity';

@Table({
  tableName: 'user_activities',
  timestamps: true,
})
export class UserActivity extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @ForeignKey(() => Parcours)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  parcoursId: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startDatetime: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  endDatetime: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  distanceCoveredKm: number;

  @Column({
    type: DataType.ENUM('walking', 'running', 'cycling'),
    allowNull: false,
  })
  activityType: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  pointsEarned: number;

  @Column({
    type: DataType.ENUM('in_progress', 'completed', 'abandoned'),
    allowNull: false,
    defaultValue: 'in_progress',
  })
  status: string;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: true,
  })
  averageSpeed: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  gpxTraceUrl: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Parcours)
  parcours: Parcours;

  @HasMany(() => UserPOIVisit)
  poiVisits: UserPOIVisit[];

  @HasMany(() => UserChallengeProgress)
  challengeProgress: UserChallengeProgress[];
}
