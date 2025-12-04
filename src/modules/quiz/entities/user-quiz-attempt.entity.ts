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
import { Quiz } from './quiz.entity';

@Table({ tableName: 'user_quiz_attempts', timestamps: true, updatedAt: false })
export class UserQuizAttempt extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  userId: number;

  @ForeignKey(() => Quiz)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  quizId: number;

  @Column({ type: DataType.DATE, allowNull: false })
  attemptDatetime: Date;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  score: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  pointsEarned: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  timeTakenSeconds: number;

  @CreatedAt
  createdAt: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Quiz)
  quiz: Quiz;
}
