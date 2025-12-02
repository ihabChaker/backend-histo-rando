import { Sequelize } from 'sequelize-typescript';
import { User } from '../../src/modules/users/entities/user.entity';
import { Parcours } from '../../src/modules/parcours/entities/parcours.entity';
import { PointOfInterest } from '../../src/modules/poi/entities/point-of-interest.entity';
import { Podcast } from '../../src/modules/media/entities/podcast.entity';
import { Quiz } from '../../src/modules/quiz/entities/quiz.entity';
import { Question } from '../../src/modules/quiz/entities/question.entity';
import { Answer } from '../../src/modules/quiz/entities/answer.entity';
import { Challenge } from '../../src/modules/challenge/entities/challenge.entity';
import { TreasureHunt } from '../../src/modules/treasure-hunt/entities/treasure-hunt.entity';
import { Reward } from '../../src/modules/reward/entities/reward.entity';
import { UserActivity } from '../../src/modules/activity/entities/user-activity.entity';
import { UserPOIVisit } from '../../src/modules/activity/entities/user-poi-visit.entity';
import { UserQuizAttempt } from '../../src/modules/quiz/entities/user-quiz-attempt.entity';
import { UserChallengeProgress } from '../../src/modules/challenge/entities/user-challenge-progress.entity';
import { UserTreasureFound } from '../../src/modules/treasure-hunt/entities/user-treasure-found.entity';
import { UserRewardRedeemed } from '../../src/modules/reward/entities/user-reward-redeemed.entity';
import { ParcoursPodcast } from '../../src/modules/parcours/entities/parcours-podcast.entity';
import { ParcoursQuiz } from '../../src/modules/parcours/entities/parcours-quiz.entity';
import { HistoricalBattalion } from '../../src/modules/historical/entities/historical-battalion.entity';
import { BattalionRoute } from '../../src/modules/historical/entities/battalion-route.entity';

let sequelize: Sequelize | null = null;

export async function setupTestDatabase(): Promise<Sequelize> {
  if (sequelize) {
    return sequelize;
  }

  const testDbName = process.env.TEST_DB_NAME || process.env.DB_DATABASE!;
  const dbHost = process.env.DB_HOST!;
  const dbPort = parseInt(process.env.DB_PORT!, 10);
  const dbUser = process.env.DB_USERNAME!;
  const dbPassword = String(process.env.DB_PASSWORD!);
  const dbDialect = process.env.DB_DIALECT! as any;

  console.log(
    `🔧 Database Config: user=${dbUser}, password=${dbPassword.substring(0, 4)}***, db=${testDbName}`,
  );

  sequelize = new Sequelize({
    dialect: dbDialect,
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
    console.log('✅ Test database connection established successfully');
  } catch (error) {
    console.error('❌ Unable to connect to test database:', error);
    throw error;
  }

  return sequelize;
}

export async function syncDatabase(force: boolean = true): Promise<void> {
  if (!sequelize) {
    throw new Error('Database not initialized. Call setupTestDatabase() first');
  }

  await sequelize.sync({ force });
  console.log(`✅ Test database synced${force ? ' (force: true)' : ''}`);
}

export async function cleanDatabase(): Promise<void> {
  if (!sequelize) {
    return;
  }

  try {
    // Get all table names from models
    const tableNames = Object.keys(sequelize.models).map(
      (modelName) => sequelize!.models[modelName].tableName,
    );

    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Truncate all tables using raw SQL
    for (const tableName of tableNames) {
      await sequelize.query(`TRUNCATE TABLE \`${tableName}\``);
    }

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Test database cleaned');
  } catch (error) {
    console.error('Error cleaning database:', error);
    // Re-enable foreign key checks even on error
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {
      // Ignore error when re-enabling
    }
    // Fallback: drop and recreate
    await sequelize.sync({ force: true });
    console.log('✅ Test database cleaned (via sync force)');
  }
}

export async function closeDatabase(): Promise<void> {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
    console.log('✅ Test database connection closed');
  }
}

export function getSequelizeInstance(): Sequelize {
  if (!sequelize) {
    throw new Error('Database not initialized. Call setupTestDatabase() first');
  }
  return sequelize;
}

export function setSequelizeInstance(instance: Sequelize): void {
  sequelize = instance;
}
