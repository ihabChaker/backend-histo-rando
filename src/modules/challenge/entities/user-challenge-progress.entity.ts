import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    CreatedAt,
    UpdatedAt,
} from 'sequelize-typescript';
import { User } from '@/modules/users/entities/user.entity';
import { Challenge } from './challenge.entity';
import { UserActivity } from '@/modules/activity/entities/user-activity.entity';

@Table({ tableName: 'user_challenge_progress', timestamps: true })
export class UserChallengeProgress extends Model {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    userId: number;

    @ForeignKey(() => Challenge)
    @Column({ type: DataType.INTEGER, allowNull: false })
    challengeId: number;

    @ForeignKey(() => UserActivity)
    @Column({ type: DataType.INTEGER, allowNull: true })
    activityId: number;

    @Column({ type: DataType.DATE, allowNull: false })
    startDatetime: Date;

    @Column({ type: DataType.DATE, allowNull: true })
    completionDatetime: Date;

    @Column({
        type: DataType.ENUM('started', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'started',
    })
    status: string;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    pointsEarned: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => User)
    user: User;

    @BelongsTo(() => Challenge)
    challenge: Challenge;

    @BelongsTo(() => UserActivity)
    activity: UserActivity;
}
