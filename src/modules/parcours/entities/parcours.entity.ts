import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsToMany,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { PointOfInterest } from "@/modules/poi/entities/point-of-interest.entity";
import { UserActivity } from "@/modules/activity/entities/user-activity.entity";
import { TreasureHunt } from "@/modules/treasure-hunt/entities/treasure-hunt.entity";
import { Podcast } from "@/modules/media/entities/podcast.entity";
import { Quiz } from "@/modules/quiz/entities/quiz.entity";
import { ParcoursPodcast } from "./parcours-podcast.entity";
import { ParcoursQuiz } from "./parcours-quiz.entity";
import { BattalionRoute } from "@/modules/historical/entities/battalion-route.entity";

@Table({
  tableName: "parcours",
  timestamps: true,
})
export class Parcours extends Model {
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
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.ENUM("easy", "medium", "hard"),
    allowNull: false,
  })
  difficultyLevel: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const value = this.getDataValue("distanceKm");
      return value ? parseFloat(value.toString()) : 0;
    },
  })
  distanceKm: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "Duration in minutes",
  })
  estimatedDuration: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isPmrAccessible: boolean;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  historicalTheme: string;

  @Column({
    type: DataType.DECIMAL(10, 8),
    allowNull: false,
    get() {
      const value = this.getDataValue("startingPointLat");
      return value ? parseFloat(value.toString()) : 0;
    },
  })
  startingPointLat: number;

  @Column({
    type: DataType.DECIMAL(11, 8),
    allowNull: false,
    get() {
      const value = this.getDataValue("startingPointLon");
      return value ? parseFloat(value.toString()) : 0;
    },
  })
  startingPointLon: number;
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  gpxFileUrl: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  imageUrl: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive: boolean;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  creationDate: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  updatedAt: Date;

  @HasMany(() => PointOfInterest)
  pointsOfInterest: PointOfInterest[];

  @HasMany(() => UserActivity)
  activities: UserActivity[];

  @HasMany(() => TreasureHunt)
  treasures: TreasureHunt[];

  @BelongsToMany(() => Podcast, () => ParcoursPodcast)
  podcasts: Podcast[];

  @BelongsToMany(() => Quiz, () => ParcoursQuiz)
  quizzes: Quiz[];

  @HasMany(() => BattalionRoute)
  battalionRoutes: BattalionRoute[];
}
