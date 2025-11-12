import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Podcast } from './entities/podcast.entity';
import { ParcoursPodcast } from '@/modules/parcours/entities/parcours-podcast.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import {
  CreatePodcastDto,
  UpdatePodcastDto,
  AssociatePodcastToParcoursDto,
} from './dto/podcast.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Podcast)
    private podcastModel: typeof Podcast,
    @InjectModel(ParcoursPodcast)
    private parcoursPodcastModel: typeof ParcoursPodcast,
    @InjectModel(Parcours)
    private parcoursModel: typeof Parcours,
  ) {}

  async createPodcast(createDto: CreatePodcastDto): Promise<Podcast> {
    return this.podcastModel.create(createDto as any);
  }

  async findAllPodcasts(): Promise<Podcast[]> {
    return this.podcastModel.findAll({
      include: [
        {
          model: Parcours,
          through: { attributes: ['playOrder', 'suggestedKm'] },
        },
      ],
      order: [['creationDate', 'DESC']],
    });
  }

  async findOnePodcast(id: number): Promise<Podcast> {
    const podcast = await this.podcastModel.findByPk(id, {
      include: [
        {
          model: Parcours,
          through: { attributes: ['playOrder', 'suggestedKm'] },
        },
      ],
    });
    if (!podcast) {
      throw new NotFoundException(`Podcast with ID ${id} not found`);
    }
    return podcast;
  }

  async updatePodcast(
    id: number,
    updateDto: UpdatePodcastDto,
  ): Promise<Podcast> {
    const podcast = await this.findOnePodcast(id);
    await podcast.update(updateDto);
    return podcast;
  }

  async removePodcast(id: number): Promise<void> {
    const podcast = await this.findOnePodcast(id);
    await podcast.destroy();
  }

  async associatePodcastToParcours(
    podcastId: number,
    dto: AssociatePodcastToParcoursDto,
  ): Promise<ParcoursPodcast> {
    // Verify podcast exists
    await this.findOnePodcast(podcastId);

    // Verify parcours exists
    const parcours = await this.parcoursModel.findByPk(dto.parcoursId);
    if (!parcours) {
      throw new NotFoundException(
        `Parcours with ID ${dto.parcoursId} not found`,
      );
    }

    return this.parcoursPodcastModel.create({
      podcastId,
      parcoursId: dto.parcoursId,
      playOrder: dto.playOrder,
      suggestedKm: dto.suggestedKm,
    } as any);
  }

  async getPodcastsByParcours(parcoursId: number): Promise<Podcast[]> {
    return this.podcastModel.findAll({
      include: [
        {
          model: Parcours,
          where: { id: parcoursId },
          through: { attributes: ['playOrder', 'suggestedKm'] },
        },
      ],
      order: [
        [
          { model: Parcours, as: 'parcours' },
          ParcoursPodcast,
          'playOrder',
          'ASC',
        ],
      ],
    });
  }

  async dissociatePodcastFromParcours(
    podcastId: number,
    parcoursId: number,
  ): Promise<void> {
    const association = await this.parcoursPodcastModel.findOne({
      where: { podcastId, parcoursId },
    });
    if (!association) {
      throw new NotFoundException('Association not found');
    }
    await association.destroy();
  }
}
