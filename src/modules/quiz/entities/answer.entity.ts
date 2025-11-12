import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { Question } from './question.entity';

@Table({ tableName: 'answers', timestamps: false })
export class Answer extends Model {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id: number;

    @ForeignKey(() => Question)
    @Column({ type: DataType.INTEGER, allowNull: false })
    questionId: number;

    @Column({ type: DataType.STRING(255), allowNull: false })
    answerText: string;

    @Column({ type: DataType.BOOLEAN, allowNull: false })
    isCorrect: boolean;

    @BelongsTo(() => Question)
    question: Question;
}
