import {
    Table,
    Column,
    Model,
    DataType,
    BelongsToMany,
    CreatedAt,
} from 'sequelize-typescript';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import { ParcoursPodcast } from '@/modules/parcours/entities/parcours-podcast.entity';

@Table({
    tableName: 'podcasts',
    timestamps: true,
})
export class Podcast extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column({
        type: DataType.STRING(200),
        allowNull: false,
    })
    title: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    description: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    durationSeconds: number;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    audioFileUrl: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
    })
    narrator: string;

    @Column({
        type: DataType.STRING(10),
        allowNull: false,
        defaultValue: 'fr',
    })
    language: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    thumbnailUrl: string;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    creationDate: Date;

    @BelongsToMany(() => Parcours, () => ParcoursPodcast)
    parcours: Parcours[];
}
