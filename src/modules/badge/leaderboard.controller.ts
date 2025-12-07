import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('leaderboard')
@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeaderboardController {
  constructor(private readonly badgeService: BadgeService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir le classement des utilisateurs' })
  getLeaderboard(@Query('period') period: string) {
    return this.badgeService.getLeaderboard(period);
  }

  @Get('global')
  @ApiOperation({ summary: 'Obtenir le classement global' })
  getGlobalLeaderboard() {
    return this.badgeService.getLeaderboard('all');
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Obtenir le classement hebdomadaire' })
  getWeeklyLeaderboard() {
    // TODO: Implement weekly filtering based on actual dates
    // For now, return the same as global
    return this.badgeService.getLeaderboard('week');
  }
}
