import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
    CreatedAt,
} from 'sequelize-typescript';
import { UserRewardRedeemed } from './user-reward-redeemed.entity';

@Table({ tableName: 'rewards', timestamps: true, updatedAt: false })
export class Reward extends Model {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id: number;

    @Column({ type: DataType.STRING(200), allowNull: false })
    name: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    description: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    pointsCost: number;

    @Column({
        type: DataType.ENUM('discount', 'gift', 'badge', 'premium_content'),
        allowNull: false,
    })
    rewardType: string;

    @Column({ type: DataType.STRING(200), allowNull: true })
    partnerName: string;

    @Column({ type: DataType.INTEGER, allowNull: true })
    stockQuantity: number;

    @Column({ type: DataType.STRING(255), allowNull: true })
    imageUrl: string;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
    isAvailable: boolean;

    @CreatedAt
    createdAt: Date;

    @HasMany(() => UserRewardRedeemed)
    redemptions: UserRewardRedeemed[];
}
