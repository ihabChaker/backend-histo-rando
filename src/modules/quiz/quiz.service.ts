import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { UserQuizAttempt } from './entities/user-quiz-attempt.entity';
import { ParcoursQuiz } from '@/modules/parcours/entities/parcours-quiz.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import { User } from '@/modules/users/entities/user.entity';
import {
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateAnswerDto,
  UpdateAnswerDto,
  SubmitQuizAttemptDto,
  AssociateQuizToParcoursDto,
} from './dto/quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz) private quizModel: typeof Quiz,
    @InjectModel(Question) private questionModel: typeof Question,
    @InjectModel(Answer) private answerModel: typeof Answer,
    @InjectModel(UserQuizAttempt)
    private quizAttemptModel: typeof UserQuizAttempt,
    @InjectModel(ParcoursQuiz) private parcoursQuizModel: typeof ParcoursQuiz,
    @InjectModel(Parcours) private parcoursModel: typeof Parcours,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  // Quiz CRUD
  async createQuiz(createDto: CreateQuizDto): Promise<Quiz> {
    return this.quizModel.create(createDto as any);
  }

  async findAllQuizzes(): Promise<Quiz[]> {
    return this.quizModel.findAll({
      include: [
        {
          model: Question,
          include: [Answer],
        },
      ],
      order: [['creationDate', 'DESC']],
    });
  }

  async findOneQuiz(id: number): Promise<Quiz> {
    const quiz = await this.quizModel.findByPk(id, {
      include: [
        {
          model: Question,
          include: [Answer],
        },
      ],
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
    return quiz;
  }

  async updateQuiz(id: number, updateDto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findOneQuiz(id);
    await quiz.update(updateDto);
    return quiz;
  }

  async removeQuiz(id: number): Promise<void> {
    const quiz = await this.findOneQuiz(id);
    await quiz.destroy();
  }

  // Question CRUD
  async createQuestion(createDto: CreateQuestionDto): Promise<Question> {
    await this.findOneQuiz(createDto.quizId); // Verify quiz exists
    return this.questionModel.create(createDto as any);
  }

  async updateQuestion(
    id: number,
    updateDto: UpdateQuestionDto,
  ): Promise<Question> {
    const question = await this.questionModel.findByPk(id);
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    await question.update(updateDto);
    return question;
  }

  async removeQuestion(id: number): Promise<void> {
    const question = await this.questionModel.findByPk(id);
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    await question.destroy();
  }

  // Answer CRUD
  async createAnswer(createDto: CreateAnswerDto): Promise<Answer> {
    const question = await this.questionModel.findByPk(createDto.questionId);
    if (!question) {
      throw new NotFoundException(
        `Question with ID ${createDto.questionId} not found`,
      );
    }
    return this.answerModel.create(createDto as any);
  }

  async updateAnswer(id: number, updateDto: UpdateAnswerDto): Promise<Answer> {
    const answer = await this.answerModel.findByPk(id);
    if (!answer) {
      throw new NotFoundException(`Answer with ID ${id} not found`);
    }
    await answer.update(updateDto);
    return answer;
  }

  async removeAnswer(id: number): Promise<void> {
    const answer = await this.answerModel.findByPk(id);
    if (!answer) {
      throw new NotFoundException(`Answer with ID ${id} not found`);
    }
    await answer.destroy();
  }

  // Quiz Attempts
  async submitQuizAttempt(
    userId: number,
    dto: SubmitQuizAttemptDto,
  ): Promise<any> {
    const quiz = await this.findOneQuiz(dto.quizId);

    let score = 0;
    let pointsEarned = 0;
    const results: Array<{
      questionId: number;
      correct: boolean;
      points: number;
    }> = [];

    for (const userAnswer of dto.answers) {
      const question = await this.questionModel.findByPk(
        userAnswer.questionId,
        {
          include: [Answer],
        },
      );
      if (!question) continue;

      const selectedAnswer = await this.answerModel.findByPk(
        userAnswer.answerId,
      );
      if (!selectedAnswer) continue;

      if (selectedAnswer.isCorrect) {
        score += question.points;
        results.push({
          questionId: question.id,
          correct: true,
          points: question.points,
        });
      } else {
        results.push({ questionId: question.id, correct: false, points: 0 });
      }
    }

    // Award points if score is high enough (e.g., > 50%)
    const maxScore = quiz.questions?.reduce((sum, q) => sum + q.points, 0) || 0;
    if (maxScore > 0 && score / maxScore >= 0.5) {
      pointsEarned = quiz.pointsReward;

      // Update user points
      const user = await this.userModel.findByPk(userId);
      if (user) {
        await user.update({
          totalPoints: user.totalPoints + pointsEarned,
        });
      }
    }

    const attempt = await this.quizAttemptModel.create({
      userId,
      quizId: dto.quizId,
      attemptDatetime: new Date(),
      score,
      pointsEarned,
      timeTakenSeconds: dto.timeTakenSeconds || 0,
    } as any);

    const isPassing = maxScore > 0 && score / maxScore >= 0.5;

    return {
      quizId: dto.quizId,
      attempt,
      score,
      maxScore,
      pointsEarned,
      isPassing,
      results,
    };
  }

  async getUserQuizAttempts(userId: number): Promise<UserQuizAttempt[]> {
    return this.quizAttemptModel.findAll({
      where: { userId },
      include: [Quiz],
      order: [['attemptDatetime', 'DESC']],
    });
  }

  // Parcours associations
  async associateQuizToParcours(
    quizId: number,
    dto: AssociateQuizToParcoursDto,
  ): Promise<ParcoursQuiz> {
    await this.findOneQuiz(quizId);
    const parcours = await this.parcoursModel.findByPk(dto.parcoursId);
    if (!parcours) {
      throw new NotFoundException(
        `Parcours with ID ${dto.parcoursId} not found`,
      );
    }

    return this.parcoursQuizModel.create({
      quizId,
      parcoursId: dto.parcoursId,
      unlockAtKm: dto.unlockAtKm || 0,
    } as any);
  }

  async getQuizzesByParcours(parcoursId: number): Promise<Quiz[]> {
    return this.quizModel.findAll({
      include: [
        {
          model: Parcours,
          where: { id: parcoursId },
          through: { attributes: ['unlockAtKm'] },
        },
        {
          model: Question,
          include: [Answer],
        },
      ],
    });
  }
}
