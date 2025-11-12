import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { HistoricalBattalion } from './historical-battalion.entity';
import { Parcours } from '@/modules/parcours/entities/parcours.entity';

@Table({ tableName: 'battalion_routes', timestamps: false })
export class BattalionRoute extends Model {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id: number;

    @ForeignKey(() => HistoricalBattalion)
    @Column({ type: DataType.INTEGER, allowNull: false })
    battalionId: number;

    @ForeignKey(() => Parcours)
    @Column({ type: DataType.INTEGER, allowNull: false })
    parcoursId: number;

    @Column({ type: DataType.DATEONLY, allowNull: true })
    routeDate: Date;

    @Column({ type: DataType.TEXT, allowNull: true })
    historicalContext: string;

    @BelongsTo(() => HistoricalBattalion)
    battalion: HistoricalBattalion;

    @BelongsTo(() => Parcours)
    parcours: Parcours;
}
