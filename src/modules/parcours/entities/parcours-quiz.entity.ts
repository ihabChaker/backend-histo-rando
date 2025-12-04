import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Parcours } from './parcours.entity';
import { Quiz } from '@/modules/quiz/entities/quiz.entity';

@Table({
  tableName: 'parcours_quizzes',
  timestamps: false,
})
export class ParcoursQuiz extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => Parcours)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  parcoursId: number;

  @ForeignKey(() => Quiz)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  quizId: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Unlock at this kilometer',
  })
  unlockAtKm: number;
}
