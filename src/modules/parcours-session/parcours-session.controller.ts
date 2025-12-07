import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ParcoursSessionService } from './parcours-session.service';
import {
  StartSessionDto,
  UpdateSessionDto,
  CompleteSessionDto,
} from './dto/session.dto';

@ApiTags('parcours-sessions')
@ApiBearerAuth()
@Controller('parcours-sessions')
export class ParcoursSessionController {
  constructor(private readonly sessionService: ParcoursSessionService) {}

  @Post('start')
  @ApiOperation({ summary: 'Démarrer ou reprendre une session de parcours' })
  @ApiResponse({ status: 201, description: 'Session démarrée' })
  async startSession(@Req() req: any, @Body() dto: StartSessionDto) {
    console.log('🔍 Start Session - User from token:', {
      userId: req.user?.id,
      sub: req.user?.sub,
      email: req.user?.email,
      fullUser: req.user,
    });
    console.log('📍 Start Session - DTO:', dto);
    return this.sessionService.startSession(req.user.id, dto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtenir toutes les sessions actives' })
  async getActiveSessions(@Req() req: any) {
    return this.sessionService.getAllActiveSessions(req.user.id);
  }

  @Get('active/:parcoursId')
  @ApiOperation({
    summary: 'Obtenir la session active pour un parcours spécifique',
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  async getActiveSession(
    @Req() req: any,
    @Param('parcoursId', ParseIntPipe) parcoursId: number,
  ) {
    return this.sessionService.getActiveSession(req.user.id, parcoursId);
  }

  @Put(':id/update')
  @ApiOperation({ summary: 'Mettre à jour la position GPS et progression' })
  @ApiParam({ name: 'id', description: 'ID de la session' })
  async updateSession(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessionService.updateSession(id, req.user.id, dto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Terminer une session de parcours' })
  @ApiParam({ name: 'id', description: 'ID de la session' })
  @ApiResponse({ status: 200, description: 'Session terminée avec succès' })
  async completeSession(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteSessionDto,
  ) {
    return this.sessionService.completeSession(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer/abandonner une session' })
  @ApiParam({ name: 'id', description: 'ID de la session' })
  async deleteSession(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    await this.sessionService.deleteSession(id, req.user.id);
    return { message: 'Session supprimée' };
  }
}
