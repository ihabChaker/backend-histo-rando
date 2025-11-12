import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  CreatedAt,
} from 'sequelize-typescript';
import { UserChallengeProgress } from './user-challenge-progress.entity';

@Table({ tableName: 'challenges', timestamps: true, updatedAt: false })
export class Challenge extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING(200), allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({
    type: DataType.ENUM(
      'weighted_backpack',
      'period_clothing',
      'distance',
      'time',
    ),
    allowNull: false,
  })
  challengeType: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 50 })
  pointsReward: number;

  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false, defaultValue: 1.0 })
  difficultyMultiplier: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  isActive: boolean;

  @CreatedAt
  createdAt: Date;

  @HasMany(() => UserChallengeProgress)
  userProgress: UserChallengeProgress[];
}
