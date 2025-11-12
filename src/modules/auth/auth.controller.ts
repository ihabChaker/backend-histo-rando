import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: "Inscription d'un nouvel utilisateur",
    description:
      "Créer un nouveau compte utilisateur avec email, username et mot de passe. Retourne un JWT token pour l'authentification.",
  })
  @ApiBody({
    type: RegisterDto,
    description: "Informations d'inscription",
    examples: {
      example1: {
        summary: 'Utilisateur standard',
        value: {
          email: 'jean.dupont@example.com',
          username: 'jeandupont',
          password: 'SecurePassword123!',
          firstName: 'Jean',
          lastName: 'Dupont',
          isPmr: false,
        },
      },
      example2: {
        summary: 'Utilisateur PMR',
        value: {
          email: 'marie.martin@example.com',
          username: 'mariemartin',
          password: 'SecurePassword456!',
          firstName: 'Marie',
          lastName: 'Martin',
          isPmr: true,
          phoneNumber: '+33612345678',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
          isPmr: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be a valid email',
          'password must be at least 8 characters',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email ou username déjà utilisé',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email déjà utilisé',
        error: 'Conflict',
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion utilisateur',
    description:
      'Authentifier un utilisateur avec email et mot de passe. Retourne un JWT token.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Identifiants de connexion',
    examples: {
      example1: {
        summary: 'Connexion standard',
        value: {
          email: 'jean.dupont@example.com',
          password: 'SecurePassword123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
          isPmr: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be a valid email'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Email ou mot de passe incorrect',
    schema: {
      example: {
        statusCode: 401,
        message: 'Email ou mot de passe incorrect',
        error: 'Unauthorized',
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
