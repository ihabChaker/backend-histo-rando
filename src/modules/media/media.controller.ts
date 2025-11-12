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
import { MediaService } from "./media.service";
import {
  CreatePodcastDto,
  UpdatePodcastDto,
  AssociatePodcastToParcoursDto,
} from "./dto/podcast.dto";
import { Public } from "@/common/decorators/public.decorator";

@ApiTags("media")
@ApiBearerAuth()
@Controller("podcasts")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @ApiOperation({
    summary: "Créer un nouveau podcast",
    description:
      "Ajouter un podcast audio avec narrateur et description historique",
  })
  @ApiResponse({
    status: 201,
    description: "Podcast créé avec succès",
    schema: {
      example: {
        id: 1,
        title: "Le Débarquement de Normandie",
        description: "Récit historique du D-Day",
        durationSeconds: 600,
        audioFileUrl: "https://example.com/podcasts/dday.mp3",
        narrator: "Jean Dupont",
        language: "fr",
        thumbnailUrl: "https://example.com/thumbnails/dday.jpg",
        creationDate: "2025-11-12T14:30:00Z",
      },
    },
  })
  @ApiResponse({ status: 400, description: "Données invalides" })
  async create(@Body() createDto: CreatePodcastDto) {
    return this.mediaService.createPodcast(createDto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: "Lister tous les podcasts",
    description:
      "Obtenir la liste de tous les podcasts disponibles avec leurs associations aux parcours",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des podcasts",
    schema: {
      example: [
        {
          id: 1,
          title: "Le Débarquement de Normandie",
          durationSeconds: 600,
          narrator: "Jean Dupont",
          language: "fr",
          parcours: [
            {
              id: 1,
              name: "Chemin du Débarquement",
              ParcoursPodcast: { playOrder: 1, suggestedKm: 2.5 },
            },
          ],
        },
      ],
    },
  })
  async findAll() {
    return this.mediaService.findAllPodcasts();
  }

  @Public()
  @Get(":id")
  @ApiOperation({
    summary: "Obtenir un podcast par ID",
    description: "Retourne les détails complets d'un podcast",
  })
  @ApiParam({ name: "id", description: "ID du podcast" })
  @ApiResponse({ status: 200, description: "Podcast trouvé" })
  @ApiResponse({ status: 404, description: "Podcast non trouvé" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.mediaService.findOnePodcast(id);
  }

  @Put(":id")
  @ApiOperation({
    summary: "Mettre à jour un podcast",
    description: "Modifier les informations d'un podcast existant",
  })
  @ApiParam({ name: "id", description: "ID du podcast" })
  @ApiResponse({ status: 200, description: "Podcast mis à jour" })
  @ApiResponse({ status: 404, description: "Podcast non trouvé" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdatePodcastDto
  ) {
    return this.mediaService.updatePodcast(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Supprimer un podcast",
    description: "Supprimer définitivement un podcast",
  })
  @ApiParam({ name: "id", description: "ID du podcast" })
  @ApiResponse({ status: 200, description: "Podcast supprimé" })
  @ApiResponse({ status: 404, description: "Podcast non trouvé" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.mediaService.removePodcast(id);
    return { message: "Podcast supprimé avec succès" };
  }

  @Post(":id/parcours")
  @ApiOperation({
    summary: "Associer un podcast à un parcours",
    description:
      "Créer une association entre un podcast et un parcours avec ordre de lecture",
  })
  @ApiParam({ name: "id", description: "ID du podcast" })
  @ApiResponse({ status: 201, description: "Association créée" })
  @ApiResponse({ status: 404, description: "Podcast ou parcours non trouvé" })
  async associateToParcours(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: AssociatePodcastToParcoursDto
  ) {
    return this.mediaService.associatePodcastToParcours(id, dto);
  }

  @Public()
  @Get("parcours/:parcoursId")
  @ApiOperation({
    summary: "Obtenir les podcasts d'un parcours",
    description:
      "Lister tous les podcasts associés à un parcours spécifique, triés par ordre de lecture",
  })
  @ApiParam({ name: "parcoursId", description: "ID du parcours" })
  @ApiResponse({ status: 200, description: "Liste des podcasts du parcours" })
  async getPodcastsByParcours(
    @Param("parcoursId", ParseIntPipe) parcoursId: number
  ) {
    return this.mediaService.getPodcastsByParcours(parcoursId);
  }

  @Delete(":podcastId/parcours/:parcoursId")
  @ApiOperation({
    summary: "Dissocier un podcast d'un parcours",
    description: "Supprimer l'association entre un podcast et un parcours",
  })
  @ApiParam({ name: "podcastId", description: "ID du podcast" })
  @ApiParam({ name: "parcoursId", description: "ID du parcours" })
  @ApiResponse({ status: 200, description: "Association supprimée" })
  @ApiResponse({ status: 404, description: "Association non trouvée" })
  async dissociate(
    @Param("podcastId", ParseIntPipe) podcastId: number,
    @Param("parcoursId", ParseIntPipe) parcoursId: number
  ) {
    await this.mediaService.dissociatePodcastFromParcours(
      podcastId,
      parcoursId
    );
    return { message: "Association supprimée avec succès" };
  }
}
