import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { PromoteToAdminDto } from './dto/promote-to-admin.dto';
import { AuthResponse, JwtPayload } from '@/common/types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, username, password, ...rest } = registerDto;

    // Check if user exists
    const existingUser = await this.userModel.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    const existingUsername = await this.userModel.findOne({
      where: { username },
    });

    if (existingUsername) {
      throw new ConflictException("Nom d'utilisateur déjà pris");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userModel.create({
      email,
      username,
      passwordHash,
      ...rest,
    });

    // Generate token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isPmr: user.isPmr,
        role: user.role,
        totalPoints: user.totalPoints,
        totalKm: user.totalKm,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Generate token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        totalPoints: user.totalPoints,
        totalKm: user.totalKm,
      },
    };
  }

  async validateUser(userId: number): Promise<User | null> {
    return this.userModel.findByPk(userId);
  }

  async promoteToAdmin(
    promoteDto: PromoteToAdminDto,
  ): Promise<{ message: string; user: any }> {
    const { email, secretKey } = promoteDto;

    // Verify secret key
    const adminSecretKey = this.configService.get<string>(
      'ADMIN_PROMOTION_SECRET',
    );
    if (!adminSecretKey || secretKey !== adminSecretKey) {
      throw new ForbiddenException('Invalid secret key');
    }

    // Find user
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already admin
    if (user.role === 'admin') {
      return {
        message: 'User is already an admin',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      };
    }

    // Promote to admin
    user.role = 'admin';
    await user.save();

    return {
      message: 'User successfully promoted to admin',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }
}
