import { Sequelize } from "sequelize-typescript";
import { User } from "../../src/modules/users/entities/user.entity";
import { Parcours } from "../../src/modules/parcours/entities/parcours.entity";
import { PointOfInterest } from "../../src/modules/poi/entities/point-of-interest.entity";
import { Podcast } from "../../src/modules/media/entities/podcast.entity";
import { Quiz } from "../../src/modules/quiz/entities/quiz.entity";
import { Question } from "../../src/modules/quiz/entities/question.entity";
import { Answer } from "../../src/modules/quiz/entities/answer.entity";
import { Challenge } from "../../src/modules/challenge/entities/challenge.entity";
import { TreasureHunt } from "../../src/modules/treasure-hunt/entities/treasure-hunt.entity";
import { Reward } from "../../src/modules/reward/entities/reward.entity";
import { UserActivity } from "../../src/modules/activity/entities/user-activity.entity";
import { UserPOIVisit } from "../../src/modules/activity/entities/user-poi-visit.entity";
import { UserQuizAttempt } from "../../src/modules/quiz/entities/user-quiz-attempt.entity";
import { UserChallengeProgress } from "../../src/modules/challenge/entities/user-challenge-progress.entity";
import { UserTreasureFound } from "../../src/modules/treasure-hunt/entities/user-treasure-found.entity";
import { UserRewardRedeemed } from "../../src/modules/reward/entities/user-reward-redeemed.entity";
import { ParcoursPodcast } from "../../src/modules/parcours/entities/parcours-podcast.entity";
import { ParcoursQuiz } from "../../src/modules/parcours/entities/parcours-quiz.entity";
import { HistoricalBattalion } from "../../src/modules/historical/entities/historical-battalion.entity";
import { BattalionRoute } from "../../src/modules/historical/entities/battalion-route.entity";

let sequelize: Sequelize | null = null;

export async function setupTestDatabase(): Promise<Sequelize> {
  if (sequelize) {
    return sequelize;
  }

  const testDbName = process.env.TEST_DB_NAME || "histo_rando_test";
  const dbHost = process.env.DB_HOST || "localhost";
  const dbPort = parseInt(process.env.DB_PORT || "5432", 10);
  const dbUser = process.env.DB_USER || "postgres";
  const dbPassword = String(process.env.DB_PASSWORD || "postgres");

  console.log(
    `🔧 Database Config: user=${dbUser}, password=${dbPassword.substring(0, 4)}***, db=${testDbName}`
  );

  sequelize = new Sequelize({
    dialect: "postgres",
    host: dbHost,
    port: dbPort,
    username: dbUser,
    password: dbPassword,
    database: testDbName,
    logging: false,
    models: [
      User,
      Parcours,
      PointOfInterest,
      Podcast,
      Quiz,
      Question,
      Answer,
      Challenge,
      TreasureHunt,
      Reward,
      UserActivity,
      UserPOIVisit,
      UserQuizAttempt,
      UserChallengeProgress,
      UserTreasureFound,
      UserRewardRedeemed,
      ParcoursPodcast,
      ParcoursQuiz,
      HistoricalBattalion,
      BattalionRoute,
    ],
  });

  try {
    await sequelize.authenticate();
    console.log("✅ Test database connection established successfully");
  } catch (error) {
    console.error("❌ Unable to connect to test database:", error);
    throw error;
  }

  return sequelize;
}

export async function syncDatabase(force: boolean = true): Promise<void> {
  if (!sequelize) {
    throw new Error("Database not initialized. Call setupTestDatabase() first");
  }

  await sequelize.sync({ force });
  console.log(`✅ Test database synced${force ? " (force: true)" : ""}`);
}

export async function cleanDatabase(): Promise<void> {
  if (!sequelize) {
    return;
  }

  // Clean all tables - truncate in reverse order of dependencies
  try {
    await sequelize.query("SET CONSTRAINTS ALL DEFERRED");

    await UserRewardRedeemed.truncate({ cascade: true, force: true });
    await UserTreasureFound.truncate({ cascade: true, force: true });
    await UserChallengeProgress.truncate({ cascade: true, force: true });
    await UserQuizAttempt.truncate({ cascade: true, force: true });
    await UserPOIVisit.truncate({ cascade: true, force: true });
    await UserActivity.truncate({ cascade: true, force: true });
    await ParcoursQuiz.truncate({ cascade: true, force: true });
    await ParcoursPodcast.truncate({ cascade: true, force: true });
    await Answer.truncate({ cascade: true, force: true });
    await Question.truncate({ cascade: true, force: true });
    await Quiz.truncate({ cascade: true, force: true });
    await PointOfInterest.truncate({ cascade: true, force: true });
    await BattalionRoute.truncate({ cascade: true, force: true });
    await HistoricalBattalion.truncate({ cascade: true, force: true });
    await Reward.truncate({ cascade: true, force: true });
    await TreasureHunt.truncate({ cascade: true, force: true });
    await Challenge.truncate({ cascade: true, force: true });
    await Podcast.truncate({ cascade: true, force: true });
    await Parcours.truncate({ cascade: true, force: true });
    await User.truncate({ cascade: true, force: true });

    console.log("✅ Test database cleaned");
  } catch (error) {
    console.error("Error cleaning database:", error);
    // Fallback: drop and recreate
    await sequelize.sync({ force: true });
    console.log("✅ Test database cleaned (via sync force)");
  }
}

export async function closeDatabase(): Promise<void> {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
    console.log("✅ Test database connection closed");
  }
}

export function getSequelizeInstance(): Sequelize {
  if (!sequelize) {
    throw new Error("Database not initialized. Call setupTestDatabase() first");
  }
  return sequelize;
}
