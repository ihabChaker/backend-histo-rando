import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '@/modules/users/entities/user.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';

@Table({ tableName: 'active_parcours_sessions', timestamps: false })
export class ActiveParcoursSession extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @ForeignKey(() => Parcours)
  @Column({ type: DataType.INTEGER, allowNull: false })
  parcoursId: number;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  startTime: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  lastUpdateTime: Date;

  @Column({ type: DataType.DECIMAL(10, 8), allowNull: true })
  currentLatitude: number;

  @Column({ type: DataType.DECIMAL(11, 8), allowNull: true })
  currentLongitude: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0 })
  distanceCovered: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  poisVisitedIds: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isCompleted: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  completedAt: Date;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 50 })
  completionBonus: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Parcours)
  parcours: Parcours;

  // Helper methods
  getPoisVisited(): number[] {
    if (!this.poisVisitedIds) return [];
    try {
      return JSON.parse(this.poisVisitedIds);
    } catch {
      return [];
    }
  }

  setPoisVisited(poiIds: number[]): void {
    this.poisVisitedIds = JSON.stringify(poiIds);
  }
}
