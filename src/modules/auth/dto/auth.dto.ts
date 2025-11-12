import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

export const RegisterSchema = z.object({
  username: z.string().min(3).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  isPmr: z.boolean().optional(),
  phoneNumber: z.string().max(20).optional(),
});

export class RegisterDto extends createZodDto(RegisterSchema) {
  @ApiProperty({
    example: "johndoe",
    description: "Nom d'utilisateur unique",
    minLength: 3,
    maxLength: 100,
  })
  username: string;

  @ApiProperty({
    example: "john.doe@example.com",
    description: "Adresse email",
    format: "email",
  })
  email: string;

  @ApiProperty({
    example: "SecurePass123!",
    description: "Mot de passe",
    minLength: 8,
    maxLength: 100,
    format: "password",
  })
  password: string;

  @ApiProperty({ example: "John", description: "Prénom", required: false })
  firstName?: string;

  @ApiProperty({
    example: "Doe",
    description: "Nom de famille",
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    example: false,
    description: "Personne à mobilité réduite",
    required: false,
    default: false,
  })
  isPmr?: boolean;

  @ApiProperty({
    example: "+33612345678",
    description: "Numéro de téléphone",
    required: false,
  })
  phoneNumber?: string;
}

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class LoginDto extends createZodDto(LoginSchema) {
  @ApiProperty({
    example: "john.doe@example.com",
    description: "Adresse email",
    format: "email",
  })
  email: string;

  @ApiProperty({
    example: "SecurePass123!",
    description: "Mot de passe",
    format: "password",
  })
  password: string;
}
