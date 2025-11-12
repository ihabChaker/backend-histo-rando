import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Quiz } from "./entities/quiz.entity";
import { Question } from "./entities/question.entity";
import { Answer } from "./entities/answer.entity";
import { UserQuizAttempt } from "./entities/user-quiz-attempt.entity";
import { ParcoursQuiz } from "@/modules/parcours/entities/parcours-quiz.entity";
import { Parcours } from "@/modules/parcours/entities/parcours.entity";
import { User } from "@/modules/users/entities/user.entity";
import { QuizController } from "./quiz.controller";
import { QuizService } from "./quiz.service";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Quiz,
      Question,
      Answer,
      UserQuizAttempt,
      ParcoursQuiz,
      Parcours,
      User,
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [SequelizeModule, QuizService],
})
export class QuizModule {}
