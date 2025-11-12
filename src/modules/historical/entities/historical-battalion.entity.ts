import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  CreatedAt,
} from 'sequelize-typescript';
import { BattalionRoute } from './battalion-route.entity';

@Table({
  tableName: 'historical_battalions',
  timestamps: true,
  updatedAt: false,
})
export class HistoricalBattalion extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING(200), allowNull: false })
  name: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  country: string;

  @Column({ type: DataType.STRING(200), allowNull: true })
  militaryUnit: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  period: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @CreatedAt
  createdAt: Date;

  @HasMany(() => BattalionRoute)
  routes: BattalionRoute[];
}
