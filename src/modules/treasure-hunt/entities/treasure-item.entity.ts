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
import { TreasureHunt } from './treasure-hunt.entity';
import { UserTreasureItemFound } from './user-treasure-item-found.entity';

@Table({ tableName: 'treasure_items', timestamps: true, updatedAt: false })
export class TreasureItem extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => TreasureHunt)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  treasureHuntId: number;

  @Column({ type: DataType.STRING(200), allowNull: false })
  itemName: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  imageUrl: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 10 })
  pointsValue: number;

  @Column({ type: DataType.STRING(36), allowNull: false, unique: true })
  qrCode: string;

  @CreatedAt
  createdAt: Date;

  @BelongsTo(() => TreasureHunt)
  treasureHunt: TreasureHunt;

  @HasMany(() => UserTreasureItemFound)
  foundByUsers: UserTreasureItemFound[];
}
