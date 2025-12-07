import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

// Zod Schemas
export const CreateQuizSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  isActive: z.boolean().default(true),
});

export const UpdateQuizSchema = CreateQuizSchema.partial();

export const CreateQuestionSchema = z.object({
  quizId: z.number().int().positive(),
  questionText: z.string().min(1),
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
    }),
  ),
  timeTakenSeconds: z.number().int().positive().optional(),
});

export const AssociateQuizToParcoursSchema = z.object({
  parcoursId: z.number().int().positive(),
  unlockAtKm: z.number().nonnegative().optional(),
});

// DTOs
export class CreateQuizDto extends createZodDto(CreateQuizSchema) {
  @ApiProperty({ example: 'Quiz D-Day', description: 'Titre du quiz' })
  title: string;

  @ApiProperty({
    example: 'Testez vos connaissances sur le débarquement',
    description: 'Description du quiz',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'medium',
    enum: ['easy', 'medium', 'hard'],
    description: 'Niveau de difficulté',
    default: 'medium',
  })
  difficulty: 'easy' | 'medium' | 'hard';

  @ApiProperty({
    example: true,
    description: 'Quiz actif',
    default: true,
  })
  isActive: boolean;
}

export class UpdateQuizDto extends createZodDto(UpdateQuizSchema) {
  @ApiProperty({
    example: 'Quiz D-Day - Édition 2024',
    description: 'Titre du quiz',
    required: false,
  })
  title?: string;

  @ApiProperty({
    example: 'Version mise à jour',
    description: 'Description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'hard',
    enum: ['easy', 'medium', 'hard'],
    required: false,
  })
  difficulty?: 'easy' | 'medium' | 'hard';

  @ApiProperty({ example: false, required: false })
  isActive?: boolean;
}

export class CreateQuestionDto extends createZodDto(CreateQuestionSchema) {
  @ApiProperty({ example: 1, description: 'ID du quiz' })
  quizId: number;

  @ApiProperty({
    example: 'Quelle date correspond au débarquement ?',
    description: 'Texte de la question',
  })
  questionText: string;

  @ApiProperty({ example: 1, description: 'Ordre de la question dans le quiz' })
  questionOrder: number;

  @ApiProperty({ example: 10, description: 'Points pour cette question' })
  points: number;
}

export class UpdateQuestionDto extends createZodDto(UpdateQuestionSchema) {
  @ApiProperty({
    example: 'Question mise à jour',
    required: false,
  })
  questionText?: string;

  @ApiProperty({ example: 2, required: false })
  questionOrder?: number;

  @ApiProperty({ example: 15, required: false })
  points?: number;
}

export class CreateAnswerDto extends createZodDto(CreateAnswerSchema) {
  @ApiProperty({ example: 1, description: 'ID de la question' })
  questionId: number;

  @ApiProperty({ example: '6 juin 1944', description: 'Texte de la réponse' })
  answerText: string;

  @ApiProperty({ example: true, description: 'Est-ce la bonne réponse ?' })
  isCorrect: boolean;
}

export class UpdateAnswerDto extends createZodDto(UpdateAnswerSchema) {
  @ApiProperty({ example: 'Réponse mise à jour', required: false })
  answerText?: string;

  @ApiProperty({ example: false, required: false })
  isCorrect?: boolean;
}

export class SubmitQuizAttemptDto extends createZodDto(
  SubmitQuizAttemptSchema,
) {
  @ApiProperty({ example: 1, description: 'ID du quiz' })
  quizId: number;

  @ApiProperty({
    example: [
      { questionId: 1, answerId: 1 },
      { questionId: 2, answerId: 4 },
    ],
    description: 'Liste des réponses',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        questionId: { type: 'number', example: 1 },
        answerId: { type: 'number', example: 1 },
      },
    },
  })
  answers: Array<{ questionId: number; answerId: number }>;

  @ApiProperty({
    example: 120,
    description: 'Temps pris en secondes',
    required: false,
  })
  timeTakenSeconds?: number;
}

export class AssociateQuizToParcoursDto extends createZodDto(
  AssociateQuizToParcoursSchema,
) {
  @ApiProperty({ example: 1, description: 'ID du parcours' })
  parcoursId: number;

  @ApiProperty({
    example: 5.0,
    description: 'Débloquer après X km du parcours',
    required: false,
  })
  unlockAtKm?: number;
}
