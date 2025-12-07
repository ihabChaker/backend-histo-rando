import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
} from 'sequelize-typescript';
import { User } from '@/modules/users/entities/user.entity';
import { PointOfInterest } from '@/modules/poi/entities/point-of-interest.entity';
import { UserActivity } from './user-activity.entity';
import { ActiveParcoursSession } from '@/modules/parcours-session/entities/active-parcours-session.entity';

@Table({
  tableName: 'user_poi_visits',
  timestamps: true,
  updatedAt: false,
})
export class UserPOIVisit extends Model {
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
    onDelete: 'CASCADE',
  })
  userId: number;

  @ForeignKey(() => PointOfInterest)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  poiId: number;

  @ForeignKey(() => UserActivity)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onDelete: 'CASCADE',
  })
  activityId: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  visitDatetime: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  scannedQr: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  listenedAudio: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  pointsEarned: number;

  @ForeignKey(() => ActiveParcoursSession)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  sessionId: number;

  @CreatedAt
  createdAt: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => PointOfInterest)
  poi: PointOfInterest;

  @BelongsTo(() => UserActivity)
  activity: UserActivity;

  @BelongsTo(() => ActiveParcoursSession)
  session: ActiveParcoursSession;
}
