import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  CreatedAt,
} from 'sequelize-typescript';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import { UserTreasureFound } from './user-treasure-found.entity';
import { TreasureItem } from './treasure-item.entity';

@Table({ tableName: 'treasure_hunts', timestamps: true, updatedAt: false })
export class TreasureHunt extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Parcours)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  parcoursId: number;

  @Column({ type: DataType.STRING(200), allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.DECIMAL(10, 8), allowNull: false })
  latitude: number;

  @Column({ type: DataType.DECIMAL(11, 8), allowNull: false })
  longitude: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 50 })
  scanRadiusMeters: number;

  @Column({ type: DataType.STRING(255), allowNull: true })
  qrCode: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  isActive: boolean;

  @CreatedAt
  createdAt: Date;

  @BelongsTo(() => Parcours)
  parcours: Parcours;

  @HasMany(() => UserTreasureFound)
  foundByUsers: UserTreasureFound[];

  @HasMany(() => TreasureItem)
  items: TreasureItem[];
}
