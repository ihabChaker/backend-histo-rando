import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

export const UpdateUserProfileSchema = z.object({
  username: z.string().min(3).max(100).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  isPmr: z.boolean().optional(),
  phoneNumber: z.string().max(20).optional(),
  avatarUrl: z.string().url().max(255).optional(),
});

export class UpdateUserProfileDto extends createZodDto(
  UpdateUserProfileSchema
) {
  @ApiProperty({
    example: "john_updated",
    description: "Nom d'utilisateur",
    required: false,
  })
  username?: string;

  @ApiProperty({ example: "Jean", description: "Prénom", required: false })
  firstName?: string;

  @ApiProperty({
    example: "Dupont",
    description: "Nom de famille",
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    example: true,
    description: "Personne à mobilité réduite",
    required: false,
  })
  isPmr?: boolean;

  @ApiProperty({
    example: "+33698765432",
    description: "Numéro de téléphone",
    required: false,
  })
  phoneNumber?: string;

  @ApiProperty({
    example: "https://example.com/avatars/john.jpg",
    description: "URL de l'avatar",
    required: false,
  })
  avatarUrl?: string;
}

export const UserResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isPmr: z.boolean(),
  totalPoints: z.number(),
  totalKm: z.number(),
  avatarUrl: z.string().optional(),
  phoneNumber: z.string().optional(),
  registrationDate: z.date(),
});

export class UserResponseDto extends createZodDto(UserResponseSchema) {}
