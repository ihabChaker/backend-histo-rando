import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { QuizService } from "./quiz.service";
import {
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateAnswerDto,
  UpdateAnswerDto,
  SubmitQuizAttemptDto,
  AssociateQuizToParcoursDto,
} from "./dto/quiz.dto";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Public } from "@/common/decorators/public.decorator";

@ApiTags("quiz")
@ApiBearerAuth()
@Controller("quizzes")
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // Quiz endpoints
  @Post()
  @ApiOperation({ summary: "Créer un nouveau quiz" })
  @ApiResponse({ status: 201, description: "Quiz créé" })
  async createQuiz(@Body() createDto: CreateQuizDto) {
    return this.quizService.createQuiz(createDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Lister tous les quizzes" })
  @ApiResponse({ status: 200, description: "Liste des quizzes" })
  async findAllQuizzes() {
    return this.quizService.findAllQuizzes();
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Obtenir un quiz par ID" })
  @ApiParam({ name: "id", description: "ID du quiz" })
  @ApiResponse({ status: 200, description: "Quiz trouvé" })
  @ApiResponse({ status: 404, description: "Quiz non trouvé" })
  async findOneQuiz(@Param("id", ParseIntPipe) id: number) {
    return this.quizService.findOneQuiz(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Mettre à jour un quiz" })
  @ApiParam({ name: "id", description: "ID du quiz" })
  @ApiResponse({ status: 200, description: "Quiz mis à jour" })
  async updateQuiz(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateQuizDto
  ) {
    return this.quizService.updateQuiz(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Supprimer un quiz" })
  @ApiParam({ name: "id", description: "ID du quiz" })
  @ApiResponse({ status: 200, description: "Quiz supprimé" })
  async removeQuiz(@Param("id", ParseIntPipe) id: number) {
    await this.quizService.removeQuiz(id);
    return { message: "Quiz supprimé avec succès" };
  }

  // Question endpoints
  @Post(":quizId/questions")
  @ApiOperation({ summary: "Créer une nouvelle question pour un quiz" })
  @ApiParam({ name: "quizId", description: "ID du quiz" })
  @ApiResponse({ status: 201, description: "Question créée" })
  async createQuestion(
    @Param("quizId", ParseIntPipe) quizId: number,
    @Body() createDto: Omit<CreateQuestionDto, "quizId">
  ) {
    return this.quizService.createQuestion({
      ...createDto,
      quizId,
    } as CreateQuestionDto);
  }

  @Put("questions/:id")
  @ApiOperation({ summary: "Mettre à jour une question" })
  @ApiParam({ name: "id", description: "ID de la question" })
  @ApiResponse({ status: 200, description: "Question mise à jour" })
  async updateQuestion(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateQuestionDto
  ) {
    return this.quizService.updateQuestion(id, updateDto);
  }

  @Delete("questions/:id")
  @ApiOperation({ summary: "Supprimer une question" })
  @ApiParam({ name: "id", description: "ID de la question" })
  @ApiResponse({ status: 200, description: "Question supprimée" })
  async removeQuestion(@Param("id", ParseIntPipe) id: number) {
    await this.quizService.removeQuestion(id);
    return { message: "Question supprimée avec succès" };
  }

  // Answer endpoints
  @Post("questions/:questionId/answers")
  @ApiOperation({ summary: "Créer une nouvelle réponse pour une question" })
  @ApiParam({ name: "questionId", description: "ID de la question" })
  @ApiResponse({ status: 201, description: "Réponse créée" })
  async createAnswer(
    @Param("questionId", ParseIntPipe) questionId: number,
    @Body() createDto: Omit<CreateAnswerDto, "questionId">
  ) {
    return this.quizService.createAnswer({
      ...createDto,
      questionId,
    } as CreateAnswerDto);
  }

  @Put("answers/:id")
  @ApiOperation({ summary: "Mettre à jour une réponse" })
  @ApiParam({ name: "id", description: "ID de la réponse" })
  @ApiResponse({ status: 200, description: "Réponse mise à jour" })
  async updateAnswer(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateAnswerDto
  ) {
    return this.quizService.updateAnswer(id, updateDto);
  }

  @Delete("answers/:id")
  @ApiOperation({ summary: "Supprimer une réponse" })
  @ApiParam({ name: "id", description: "ID de la réponse" })
  @ApiResponse({ status: 200, description: "Réponse supprimée" })
  async removeAnswer(@Param("id", ParseIntPipe) id: number) {
    await this.quizService.removeAnswer(id);
    return { message: "Réponse supprimée avec succès" };
  }

  // Quiz Attempt endpoints
  @Post("attempts")
  @ApiOperation({
    summary: "Soumettre une tentative de quiz",
    description: "Envoyer les réponses et obtenir le score",
  })
  @ApiResponse({
    status: 201,
    description: "Tentative enregistrée avec score",
    schema: {
      example: {
        attempt: {
          id: 1,
          userId: 1,
          quizId: 1,
          score: 80,
          pointsEarned: 50,
          timeTakenSeconds: 180,
        },
        score: 80,
        maxScore: 100,
        pointsEarned: 50,
        results: [
          { questionId: 1, correct: true, points: 10 },
          { questionId: 2, correct: false, points: 0 },
        ],
      },
    },
  })
  async submitQuizAttempt(
    @CurrentUser() user: any,
    @Body() dto: SubmitQuizAttemptDto
  ) {
    return this.quizService.submitQuizAttempt(user.sub, dto);
  }

  @Get("attempts/me")
  @ApiOperation({
    summary: "Obtenir mes tentatives de quiz",
    description: "Historique de toutes les tentatives de quiz de l'utilisateur",
  })
  @ApiResponse({ status: 200, description: "Liste des tentatives" })
  async getUserQuizAttempts(@CurrentUser() user: any) {
    return this.quizService.getUserQuizAttempts(user.sub);
  }

  // Parcours association
  @Post(":id/parcours")
  @ApiOperation({ summary: "Associer un quiz à un parcours" })
  @ApiParam({ name: "id", description: "ID du quiz" })
  @ApiResponse({ status: 201, description: "Association créée" })
  async associateQuizToParcours(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: AssociateQuizToParcoursDto
  ) {
    return this.quizService.associateQuizToParcours(id, dto);
  }

  @Public()
  @Get("parcours/:parcoursId")
  @ApiOperation({ summary: "Obtenir les quizzes d'un parcours" })
  @ApiParam({ name: "parcoursId", description: "ID du parcours" })
  @ApiResponse({ status: 200, description: "Liste des quizzes" })
  async getQuizzesByParcours(
    @Param("parcoursId", ParseIntPipe) parcoursId: number
  ) {
    return this.quizService.getQuizzesByParcours(parcoursId);
  }
}
