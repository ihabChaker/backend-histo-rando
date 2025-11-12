import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

export const CreateBattalionSchema = z.object({
  name: z.string().min(1).max(200),
  country: z.string().min(1).max(100),
  militaryUnit: z.string().min(1).max(200).optional(),
  period: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

export const UpdateBattalionSchema = CreateBattalionSchema.partial();

export const CreateBattalionRouteSchema = z.object({
  battalionId: z.number().int().positive(),
  parcoursId: z.number().int().positive(),
  routeDate: z.string(), // Date format
  historicalContext: z.string().optional(),
});

export const UpdateBattalionRouteSchema = CreateBattalionRouteSchema.omit({
  battalionId: true,
  parcoursId: true,
}).partial();

export class CreateBattalionDto extends createZodDto(CreateBattalionSchema) {
  @ApiProperty({
    example: "2nd Ranger Battalion",
    description: "Nom du bataillon",
  })
  name: string;

  @ApiProperty({ example: "USA", description: "Pays d'origine" })
  country: string;

  @ApiProperty({
    example: "US Army Rangers",
    description: "Unité militaire",
    required: false,
  })
  militaryUnit?: string;

  @ApiProperty({
    example: "Seconde Guerre Mondiale",
    description: "Période historique",
    required: false,
  })
  period?: string;

  @ApiProperty({
    example: "Bataillon d'élite américain ayant participé au débarquement",
    description: "Description",
    required: false,
  })
  description?: string;
}

export class UpdateBattalionDto extends createZodDto(UpdateBattalionSchema) {
  @ApiProperty({
    example: "2nd Ranger Battalion - Mise à jour",
    required: false,
  })
  name?: string;

  @ApiProperty({ example: "États-Unis", required: false })
  country?: string;

  @ApiProperty({ example: "Rangers", required: false })
  militaryUnit?: string;

  @ApiProperty({ example: "1944-1945", required: false })
  period?: string;

  @ApiProperty({ example: "Nouvelle description", required: false })
  description?: string;
}

export class CreateBattalionRouteDto extends createZodDto(
  CreateBattalionRouteSchema
) {
  @ApiProperty({ example: 1, description: "ID du bataillon" })
  battalionId: number;

  @ApiProperty({ example: 1, description: "ID du parcours" })
  parcoursId: number;

  @ApiProperty({
    example: "1944-06-06",
    description: "Date de la route (YYYY-MM-DD)",
  })
  routeDate: string;

  @ApiProperty({
    example: "Route d'assaut vers la Pointe du Hoc",
    description: "Contexte historique",
    required: false,
  })
  historicalContext?: string;
}

export class UpdateBattalionRouteDto extends createZodDto(
  UpdateBattalionRouteSchema
) {
  @ApiProperty({
    example: "1944-06-07",
    description: "Date de la route",
    required: false,
  })
  routeDate?: string;

  @ApiProperty({ example: "Contexte mis à jour", required: false })
  historicalContext?: string;
}
