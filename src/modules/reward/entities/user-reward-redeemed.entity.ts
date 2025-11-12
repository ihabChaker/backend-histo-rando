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
import { Reward } from './reward.entity';

@Table({ tableName: 'user_rewards_redeemed', timestamps: true, updatedAt: false })
export class UserRewardRedeemed extends Model {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    userId: number;

    @ForeignKey(() => Reward)
    @Column({ type: DataType.INTEGER, allowNull: false })
    rewardId: number;

    @Column({ type: DataType.DATE, allowNull: false })
    redemptionDatetime: Date;

    @Column({ type: DataType.INTEGER, allowNull: false })
    pointsSpent: number;

    @Column({
        type: DataType.ENUM('pending', 'redeemed', 'used'),
        allowNull: false,
        defaultValue: 'pending',
    })
    status: string;

    @Column({ type: DataType.STRING(100), allowNull: true })
    redemptionCode: string;

    @CreatedAt
    createdAt: Date;

    @BelongsTo(() => User)
    user: User;

    @BelongsTo(() => Reward)
    reward: Reward;
}
