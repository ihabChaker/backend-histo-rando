import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Parcours } from './parcours.entity';
import { Podcast } from '@/modules/media/entities/podcast.entity';

@Table({
  tableName: 'parcours_podcasts',
  timestamps: false,
})
export class ParcoursPodcast extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => Parcours)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  parcoursId: number;

  @ForeignKey(() => Podcast)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  podcastId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  playOrder: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Suggested kilometer to play',
  })
  suggestedKm: number;
}
