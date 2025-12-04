import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Quiz } from './quiz.entity';
import { Answer } from './answer.entity';

@Table({ tableName: 'questions', timestamps: false })
export class Question extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Quiz)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  quizId: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  questionText: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  correctAnswer: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  questionOrder: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 10 })
  points: number;

  @BelongsTo(() => Quiz)
  quiz: Quiz;

  @HasMany(() => Answer)
  answers: Answer[];
}
