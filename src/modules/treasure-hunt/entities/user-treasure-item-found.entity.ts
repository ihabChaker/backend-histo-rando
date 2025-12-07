import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '@/modules/users/entities/user.entity';
import { TreasureItem } from './treasure-item.entity';

@Table({ tableName: 'user_treasure_items_found', timestamps: false })
export class UserTreasureItemFound extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  userId: number;

  @ForeignKey(() => TreasureItem)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  treasureItemId: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  foundAt: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => TreasureItem)
  treasureItem: TreasureItem;
}
