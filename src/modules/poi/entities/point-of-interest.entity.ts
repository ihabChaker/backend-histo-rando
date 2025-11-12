import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    HasMany,
} from 'sequelize-typescript';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';
import { UserPOIVisit } from '@/modules/activity/entities/user-poi-visit.entity';

@Table({
    tableName: 'points_of_interest',
    timestamps: false,
})
export class PointOfInterest extends Model {
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

    @Column({
        type: DataType.STRING(200),
        allowNull: false,
    })
    name: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    description: string;

    @Column({
        type: DataType.ENUM('bunker', 'blockhaus', 'memorial', 'museum', 'beach', 'monument'),
        allowNull: false,
    })
    poiType: string;

    @Column({
        type: DataType.DECIMAL(10, 8),
        allowNull: false,
    })
    latitude: number;

    @Column({
        type: DataType.DECIMAL(11, 8),
        allowNull: false,
    })
    longitude: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
    })
    historicalPeriod: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    orderInParcours: number;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    qrCode: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    imageUrl: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    audioUrl: string;

    @BelongsTo(() => Parcours)
    parcours: Parcours;

    @HasMany(() => UserPOIVisit)
    visits: UserPOIVisit[];
}
