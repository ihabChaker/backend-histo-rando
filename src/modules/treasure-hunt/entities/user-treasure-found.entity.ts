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
import { TreasureHunt } from './treasure-hunt.entity';

@Table({ tableName: 'user_treasures_found', timestamps: true, updatedAt: false })
export class UserTreasureFound extends Model {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    userId: number;

    @ForeignKey(() => TreasureHunt)
    @Column({ type: DataType.INTEGER, allowNull: false })
    treasureId: number;

    @Column({ type: DataType.DATE, allowNull: false })
    foundDatetime: Date;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    pointsEarned: number;

    @CreatedAt
    createdAt: Date;

    @BelongsTo(() => User)
    user: User;

    @BelongsTo(() => TreasureHunt)
    treasure: TreasureHunt;
}
