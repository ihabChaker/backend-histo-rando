import { z } from "zod";
import { createZodDto } from "nestjs-zod";

// Zod Schemas
export const CreateQuizSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  pointsReward: z.number().int().positive(),
  isActive: z.boolean().default(true),
});

export const UpdateQuizSchema = CreateQuizSchema.partial();

export const CreateQuestionSchema = z.object({
  quizId: z.number().int().positive(),
  questionText: z.string().min(1),
  correctAnswer: z.string().min(1).max(255),
  questionOrder: z.number().int().positive(),
  points: z.number().int().positive(),
});

export const UpdateQuestionSchema = CreateQuestionSchema.omit({
  quizId: true,
}).partial();

export const CreateAnswerSchema = z.object({
  questionId: z.number().int().positive(),
  answerText: z.string().min(1).max(255),
  isCorrect: z.boolean(),
});

export const UpdateAnswerSchema = CreateAnswerSchema.omit({
  questionId: true,
}).partial();

export const SubmitQuizAttemptSchema = z.object({
  quizId: z.number().int().positive(),
  answers: z.array(
    z.object({
      questionId: z.number().int().positive(),
      answerId: z.number().int().positive(),
    })
  ),
  timeTakenSeconds: z.number().int().positive().optional(),
});

export const AssociateQuizToParcoursSchema = z.object({
  parcoursId: z.number().int().positive(),
  unlockAtKm: z.number().nonnegative().optional(),
});

// DTOs
export class CreateQuizDto extends createZodDto(CreateQuizSchema) {}

export class UpdateQuizDto extends createZodDto(UpdateQuizSchema) {}

export class CreateQuestionDto extends createZodDto(CreateQuestionSchema) {}

export class UpdateQuestionDto extends createZodDto(UpdateQuestionSchema) {}

export class CreateAnswerDto extends createZodDto(CreateAnswerSchema) {}

export class UpdateAnswerDto extends createZodDto(UpdateAnswerSchema) {}

export class SubmitQuizAttemptDto extends createZodDto(
  SubmitQuizAttemptSchema
) {}

export class AssociateQuizToParcoursDto extends createZodDto(
  AssociateQuizToParcoursSchema
) {}
