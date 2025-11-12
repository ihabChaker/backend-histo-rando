import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsToMany,
  CreatedAt,
} from 'sequelize-typescript';
import { Question } from './question.entity';
import { UserQuizAttempt } from './user-quiz-attempt.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import { ParcoursQuiz } from '@/modules/parcours/entities/parcours-quiz.entity';

@Table({ tableName: 'quizzes', timestamps: true, updatedAt: false })
export class Quiz extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING(200), allowNull: false })
  title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.ENUM('easy', 'medium', 'hard'), allowNull: false })
  difficulty: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 10 })
  pointsReward: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  isActive: boolean;

  @CreatedAt
  creationDate: Date;

  @HasMany(() => Question)
  questions: Question[];

  @HasMany(() => UserQuizAttempt)
  attempts: UserQuizAttempt[];

  @BelongsToMany(() => Parcours, () => ParcoursQuiz)
  parcours: Parcours[];
}
