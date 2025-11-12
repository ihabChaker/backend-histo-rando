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
import { HistoricalService } from "./historical.service";
import {
  CreateBattalionDto,
  UpdateBattalionDto,
  CreateBattalionRouteDto,
  UpdateBattalionRouteDto,
} from "./dto/historical.dto";
import { Public } from "@/common/decorators/public.decorator";

@ApiTags("historical")
@ApiBearerAuth()
@Controller("historical")
export class HistoricalController {
  constructor(private readonly historicalService: HistoricalService) {}

  // Battalion endpoints
  @Post("battalions")
  @ApiOperation({ summary: "Créer un nouveau bataillon historique" })
  @ApiResponse({ status: 201, description: "Bataillon créé" })
  async createBattalion(@Body() createDto: CreateBattalionDto) {
    return this.historicalService.createBattalion(createDto);
  }

  @Public()
  @Get("battalions")
  @ApiOperation({ summary: "Lister tous les bataillons historiques" })
  @ApiResponse({ status: 200, description: "Liste des bataillons" })
  async findAllBattalions() {
    return this.historicalService.findAllBattalions();
  }

  @Public()
  @Get("battalions/:id")
  @ApiOperation({ summary: "Obtenir un bataillon par ID" })
  @ApiParam({ name: "id", description: "ID du bataillon" })
  @ApiResponse({ status: 200, description: "Bataillon trouvé" })
  @ApiResponse({ status: 404, description: "Bataillon non trouvé" })
  async findOneBattalion(@Param("id", ParseIntPipe) id: number) {
    return this.historicalService.findOneBattalion(id);
  }

  @Put("battalions/:id")
  @ApiOperation({ summary: "Mettre à jour un bataillon" })
  @ApiParam({ name: "id", description: "ID du bataillon" })
  @ApiResponse({ status: 200, description: "Bataillon mis à jour" })
  async updateBattalion(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateBattalionDto
  ) {
    return this.historicalService.updateBattalion(id, updateDto);
  }

  @Delete("battalions/:id")
  @ApiOperation({ summary: "Supprimer un bataillon" })
  @ApiParam({ name: "id", description: "ID du bataillon" })
  @ApiResponse({ status: 200, description: "Bataillon supprimé" })
  async removeBattalion(@Param("id", ParseIntPipe) id: number) {
    await this.historicalService.removeBattalion(id);
    return { message: "Bataillon supprimé avec succès" };
  }

  // Battalion Route endpoints
  @Post("routes")
  @ApiOperation({ summary: "Créer une nouvelle route de bataillon" })
  @ApiResponse({ status: 201, description: "Route créée" })
  async createBattalionRoute(@Body() createDto: CreateBattalionRouteDto) {
    return this.historicalService.createBattalionRoute(createDto);
  }

  @Public()
  @Get("routes/battalion/:battalionId")
  @ApiOperation({ summary: "Obtenir les routes d'un bataillon" })
  @ApiParam({ name: "battalionId", description: "ID du bataillon" })
  @ApiResponse({ status: 200, description: "Liste des routes" })
  async findRoutesByBattalion(
    @Param("battalionId", ParseIntPipe) battalionId: number
  ) {
    return this.historicalService.findRoutesByBattalion(battalionId);
  }

  @Public()
  @Get("routes/parcours/:parcoursId")
  @ApiOperation({
    summary: "Obtenir l'historique des bataillons d'un parcours",
  })
  @ApiParam({ name: "parcoursId", description: "ID du parcours" })
  @ApiResponse({ status: 200, description: "Liste des routes historiques" })
  async findRoutesByParcours(
    @Param("parcoursId", ParseIntPipe) parcoursId: number
  ) {
    return this.historicalService.findRoutesByParcours(parcoursId);
  }

  @Put("routes/:id")
  @ApiOperation({ summary: "Mettre à jour une route de bataillon" })
  @ApiParam({ name: "id", description: "ID de la route" })
  @ApiResponse({ status: 200, description: "Route mise à jour" })
  async updateBattalionRoute(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateBattalionRouteDto
  ) {
    return this.historicalService.updateBattalionRoute(id, updateDto);
  }

  @Delete("routes/:id")
  @ApiOperation({ summary: "Supprimer une route de bataillon" })
  @ApiParam({ name: "id", description: "ID de la route" })
  @ApiResponse({ status: 200, description: "Route supprimée" })
  async removeBattalionRoute(@Param("id", ParseIntPipe) id: number) {
    await this.historicalService.removeBattalionRoute(id);
    return { message: "Route supprimée avec succès" };
  }
}
