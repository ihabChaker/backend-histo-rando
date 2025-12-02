import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { UserBadge } from './user-badge.entity';

@Table({ tableName: 'badges', timestamps: true })
export class Badge extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  description: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  iconUrl: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  requirement: string; // e.g., "WALK_10KM", "VISIT_5_POI"

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  points: number;

  @Column({
    type: DataType.ENUM('commun', 'rare', 'épique', 'légendaire'),
    allowNull: false,
    defaultValue: 'commun',
  })
  rarity: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  isActive: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => UserBadge)
  userBadges: UserBadge[];
}
