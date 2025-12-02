import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Badge } from './badge.entity';

@Table({ tableName: 'user_badges', timestamps: true, updatedAt: false })
export class UserBadge extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Badge)
  @Column({ type: DataType.INTEGER, allowNull: false })
  badgeId: number;

  @BelongsTo(() => Badge)
  badge: Badge;

  @CreatedAt
  earnedAt: Date;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  progress: number; // Current progress towards the badge requirement
}
