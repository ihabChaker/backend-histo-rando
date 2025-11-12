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
import { RewardService } from "./reward.service";
import {
  CreateRewardDto,
  UpdateRewardDto,
  RedeemRewardDto,
} from "./dto/reward.dto";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Public } from "@/common/decorators/public.decorator";

@ApiTags("rewards")
@ApiBearerAuth()
@Controller("rewards")
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post()
  @ApiOperation({ summary: "Créer une nouvelle récompense" })
  @ApiResponse({ status: 201, description: "Récompense créée" })
  async create(@Body() createDto: CreateRewardDto) {
    return this.rewardService.createReward(createDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Lister toutes les récompenses disponibles" })
  @ApiResponse({ status: 200, description: "Liste des récompenses" })
  async findAll() {
    return this.rewardService.findAllRewards();
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Obtenir une récompense par ID" })
  @ApiParam({ name: "id", description: "ID de la récompense" })
  @ApiResponse({ status: 200, description: "Récompense trouvée" })
  @ApiResponse({ status: 404, description: "Récompense non trouvée" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.rewardService.findOneReward(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Mettre à jour une récompense" })
  @ApiParam({ name: "id", description: "ID de la récompense" })
  @ApiResponse({ status: 200, description: "Récompense mise à jour" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateRewardDto
  ) {
    return this.rewardService.updateReward(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Supprimer une récompense" })
  @ApiParam({ name: "id", description: "ID de la récompense" })
  @ApiResponse({ status: 200, description: "Récompense supprimée" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.rewardService.removeReward(id);
    return { message: "Récompense supprimée avec succès" };
  }

  @Post("redeem")
  @ApiOperation({
    summary: "Échanger des points contre une récompense",
    description: "Utiliser vos points pour obtenir une récompense",
  })
  @ApiResponse({
    status: 201,
    description: "Récompense échangée",
    schema: {
      example: {
        redemption: {
          id: 1,
          userId: 1,
          rewardId: 1,
          redemptionDatetime: "2025-11-12T17:00:00Z",
          pointsSpent: 500,
          status: "pending",
          redemptionCode: "RWD-1731425000-ABC123",
        },
        message: "Reward redeemed successfully",
        redemptionCode: "RWD-1731425000-ABC123",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Points insuffisants ou stock épuisé",
  })
  async redeem(@CurrentUser() user: any, @Body() dto: RedeemRewardDto) {
    return this.rewardService.redeemReward(user.sub, dto);
  }

  @Get("redemptions/me")
  @ApiOperation({ summary: "Obtenir mes échanges de récompenses" })
  @ApiResponse({ status: 200, description: "Liste des échanges" })
  async getUserRedemptions(@CurrentUser() user: any) {
    return this.rewardService.getUserRedemptions(user.sub);
  }
}
