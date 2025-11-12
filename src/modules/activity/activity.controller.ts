import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { ActivityService } from "./activity.service";
import {
  CreateUserActivityDto,
  UpdateUserActivityDto,
  RecordPOIVisitDto,
} from "./dto/activity.dto";
import { CurrentUser } from "@/common/decorators/current-user.decorator";

@ApiTags("activities")
@ApiBearerAuth()
@Controller("activities")
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @ApiOperation({
    summary: "Démarrer une nouvelle activité",
    description: "Commencer un parcours (marche, course ou vélo)",
  })
  @ApiResponse({
    status: 201,
    description: "Activité démarrée",
    schema: {
      example: {
        id: 1,
        userId: 1,
        parcoursId: 1,
        activityType: "walking",
        startDatetime: "2025-11-12T14:30:00Z",
        status: "in_progress",
        distanceCoveredKm: 0,
        pointsEarned: 0,
      },
    },
  })
  @ApiResponse({ status: 404, description: "Parcours non trouvé" })
  async startActivity(
    @CurrentUser() user: any,
    @Body() createDto: CreateUserActivityDto
  ) {
    return this.activityService.startActivity(user.sub, createDto);
  }

  @Get()
  @ApiOperation({
    summary: "Obtenir toutes mes activités",
    description: "Liste de toutes les activités de l'utilisateur connecté",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des activités",
    schema: {
      example: [
        {
          id: 1,
          parcoursId: 1,
          activityType: "walking",
          startDatetime: "2025-11-12T14:30:00Z",
          endDatetime: "2025-11-12T17:45:00Z",
          status: "completed",
          distanceCoveredKm: 12.5,
          pointsEarned: 125,
          averageSpeed: 4.2,
          parcours: {
            id: 1,
            name: "Chemin du Débarquement",
          },
        },
      ],
    },
  })
  async getUserActivities(@CurrentUser() user: any) {
    return this.activityService.getUserActivities(user.sub);
  }

  @Get("stats")
  @ApiOperation({
    summary: "Obtenir les statistiques d'activités",
    description: "Statistiques globales des activités de l'utilisateur",
  })
  @ApiResponse({
    status: 200,
    description: "Statistiques des activités",
    schema: {
      example: {
        totalActivities: 10,
        completedActivities: 8,
        totalDistance: 85.3,
        totalPoints: 853,
        totalPOIVisits: 45,
      },
    },
  })
  async getActivityStats(@CurrentUser() user: any) {
    return this.activityService.getActivityStats(user.sub);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Obtenir une activité par ID",
    description: "Détails complets d'une activité avec POI visités",
  })
  @ApiParam({ name: "id", description: "ID de l'activité" })
  @ApiResponse({ status: 200, description: "Activité trouvée" })
  @ApiResponse({ status: 404, description: "Activité non trouvée" })
  async getActivity(@Param("id", ParseIntPipe) id: number) {
    return this.activityService.getActivity(id);
  }

  @Put(":id")
  @ApiOperation({
    summary: "Mettre à jour une activité",
    description:
      "Modifier une activité (compléter, abandonner, mettre à jour distance/points)",
  })
  @ApiParam({ name: "id", description: "ID de l'activité" })
  @ApiResponse({ status: 200, description: "Activité mise à jour" })
  @ApiResponse({ status: 404, description: "Activité non trouvée" })
  async updateActivity(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() updateDto: UpdateUserActivityDto
  ) {
    return this.activityService.updateActivity(id, user.sub, updateDto);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Supprimer une activité",
    description: "Supprimer une activité de l'historique",
  })
  @ApiParam({ name: "id", description: "ID de l'activité" })
  @ApiResponse({ status: 200, description: "Activité supprimée" })
  @ApiResponse({ status: 404, description: "Activité non trouvée" })
  async deleteActivity(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: any
  ) {
    await this.activityService.deleteActivity(id, user.sub);
    return { message: "Activité supprimée avec succès" };
  }

  @Post("poi-visits")
  @ApiOperation({
    summary: "Enregistrer une visite de POI",
    description:
      "Marquer un POI comme visité lors d'une activité (scan QR, écoute audio)",
  })
  @ApiResponse({
    status: 201,
    description: "Visite enregistrée",
    schema: {
      example: {
        id: 1,
        userId: 1,
        poiId: 1,
        activityId: 1,
        visitDatetime: "2025-11-12T15:30:00Z",
        scannedQr: true,
        listenedAudio: true,
        pointsEarned: 10,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "POI déjà visité ou données invalides",
  })
  async recordPOIVisit(
    @CurrentUser() user: any,
    @Body() dto: RecordPOIVisitDto
  ) {
    return this.activityService.recordPOIVisit(user.sub, dto);
  }

  @Get("poi-visits/me")
  @ApiOperation({
    summary: "Obtenir mes visites de POI",
    description: "Liste de tous les POI visités par l'utilisateur",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des visites",
    schema: {
      example: [
        {
          id: 1,
          poiId: 1,
          visitDatetime: "2025-11-12T15:30:00Z",
          scannedQr: true,
          listenedAudio: true,
          pointsEarned: 10,
          poi: {
            id: 1,
            name: "Bunker Allemand",
            poiType: "bunker",
          },
        },
      ],
    },
  })
  async getUserPOIVisits(@CurrentUser() user: any) {
    return this.activityService.getUserPOIVisits(user.sub);
  }
}
