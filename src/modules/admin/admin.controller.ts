import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get comprehensive dashboard statistics',
    description:
      'Returns detailed statistics about users, content, and platform activity',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard stats retrieved successfully',
    schema: {
      example: {
        users: {
          total: 1250,
          newLast30Days: 85,
          newLast7Days: 12,
          pmrUsers: 230,
          totalPoints: 125000,
          totalKm: 4580.5,
        },
        content: {
          parcours: { total: 45, active: 42 },
          pois: 320,
          quizzes: { total: 78, active: 75 },
          challenges: 25,
          treasures: 150,
          rewards: { total: 50, available: 42 },
          podcasts: 180,
        },
        activity: {
          totalActivities: 5420,
          completedActivities: 4210,
          activitiesLast30Days: 420,
          completionRate: '77.68',
          poiVisits: 8540,
          quizAttempts: 3250,
          quizPassRate: '68.50',
          challengesCompleted: 1240,
          treasuresFound: 2850,
          rewardsRedeemed: 840,
        },
      },
    },
  })
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Returns paginated list of all users with optional filters',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['user', 'admin'],
  })
  @ApiQuery({ name: 'isPmr', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    schema: {
      example: {
        total: 1250,
        users: [
          {
            id: 1,
            username: 'johndoe',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'user',
            isPmr: false,
            totalPoints: 850,
            totalKm: 42.5,
            registrationDate: '2025-01-15T10:00:00Z',
          },
        ],
        limit: 50,
        offset: 0,
      },
    },
  })
  async getAllUsers(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('role') role?: string,
    @Query('isPmr') isPmr?: string,
  ) {
    return this.adminService.getAllUsers({
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      role,
      isPmr: isPmr ? isPmr === 'true' : undefined,
    });
  }

  @Get('users/:id')
  @ApiOperation({
    summary: 'Get user details',
    description: 'Returns detailed information about a specific user',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User details',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/role')
  @ApiOperation({
    summary: 'Update user role',
    description: 'Change user role between user and admin',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, updateUserRoleDto.role);
  }

  @Delete('users/:id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Permanently delete a user account',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  @Get('activities/recent')
  @ApiOperation({
    summary: 'Get recent activities',
    description: 'Returns the most recent user activities',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of activities to return (default: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent activities',
    schema: {
      example: [
        {
          id: 1,
          userId: 15,
          parcoursId: 3,
          startTime: '2025-12-02T10:30:00Z',
          endTime: '2025-12-02T13:45:00Z',
          isCompleted: true,
          totalDistanceKm: 12.5,
          totalPoints: 125,
          user: {
            id: 15,
            username: 'explorer123',
            email: 'explorer@example.com',
          },
          parcours: {
            id: 3,
            name: 'Omaha Beach Trail',
            difficultyLevel: 'medium',
          },
        },
      ],
    },
  })
  async getRecentActivities(@Query('limit') limit?: string) {
    return this.adminService.getRecentActivities(
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get('stats/content')
  @ApiOperation({
    summary: 'Get content statistics',
    description:
      'Returns statistics about content distribution (parcours by difficulty, POIs by type)',
  })
  @ApiResponse({
    status: 200,
    description: 'Content statistics',
    schema: {
      example: {
        parcoursByDifficulty: [
          { difficultyLevel: 'easy', count: 15 },
          { difficultyLevel: 'medium', count: 20 },
          { difficultyLevel: 'hard', count: 10 },
        ],
        poisByType: [
          { poiType: 'bunker', count: 80 },
          { poiType: 'memorial', count: 120 },
          { poiType: 'museum', count: 50 },
          { poiType: 'battlefield', count: 70 },
        ],
      },
    },
  })
  async getContentStats() {
    return this.adminService.getContentStats();
  }

  @Get('stats/user-growth')
  @ApiOperation({
    summary: 'Get user growth statistics',
    description: 'Returns user registration trends over time',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to analyze (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'User growth data',
    schema: {
      example: [
        { date: '2025-11-02', newUsers: 5 },
        { date: '2025-11-03', newUsers: 8 },
        { date: '2025-11-04', newUsers: 3 },
      ],
    },
  })
  async getUserGrowth(@Query('days') days?: string) {
    return this.adminService.getUserGrowth(days ? parseInt(days) : undefined);
  }
}
