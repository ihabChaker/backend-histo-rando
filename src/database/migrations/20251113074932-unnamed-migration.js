'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Users table
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING(100),
      },
      lastName: {
        type: Sequelize.STRING(100),
      },
      isPmr: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      phoneNumber: {
        type: Sequelize.STRING(20),
      },
      avatarUrl: {
        type: Sequelize.STRING(500),
      },
      totalPoints: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      totalKm: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      registrationDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create Parcours table
    await queryInterface.createTable('Parcours', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      difficultyLevel: {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        allowNull: false,
      },
      distanceKm: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      estimatedDuration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      isPmrAccessible: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      historicalTheme: {
        type: Sequelize.STRING(255),
      },
      startingPointLat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      startingPointLon: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
      },
      gpxFileUrl: {
        type: Sequelize.STRING(500),
      },
      imageUrl: {
        type: Sequelize.STRING(500),
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create PointOfInterests table
    await queryInterface.createTable('PointOfInterests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      parcoursId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Parcours',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      poiType: {
        type: Sequelize.ENUM(
          'bunker',
          'blockhaus',
          'memorial',
          'museum',
          'beach',
          'monument',
        ),
        allowNull: false,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
      },
      historicalPeriod: {
        type: Sequelize.STRING(255),
      },
      orderInParcours: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      qrCode: {
        type: Sequelize.STRING(255),
        unique: true,
      },
      imageUrl: {
        type: Sequelize.STRING(500),
      },
      audioUrl: {
        type: Sequelize.STRING(500),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create Podcasts table
    await queryInterface.createTable('Podcasts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      durationSeconds: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      audioFileUrl: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      narrator: {
        type: Sequelize.STRING(100),
      },
      language: {
        type: Sequelize.STRING(10),
        defaultValue: 'fr',
      },
      thumbnailUrl: {
        type: Sequelize.STRING(500),
      },
      creationDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create ParcoursPodcasts junction table
    await queryInterface.createTable('ParcoursPodcasts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      parcoursId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Parcours',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      podcastId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Podcasts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      playOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      suggestedKm: {
        type: Sequelize.DECIMAL(10, 2),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create Quizzes table
    await queryInterface.createTable('Quizzes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      difficulty: {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        defaultValue: 'medium',
      },
      pointsReward: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create Questions table
    await queryInterface.createTable('Questions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      quizId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Quizzes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      questionText: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      questionOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      points: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create Answers table
    await queryInterface.createTable('Answers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      questionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Questions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      answerText: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      isCorrect: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create ParcoursQuizzes junction table
    await queryInterface.createTable('ParcoursQuizzes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      parcoursId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Parcours',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quizId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Quizzes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      unlockAtKm: {
        type: Sequelize.DECIMAL(10, 2),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create Challenges table
    await queryInterface.createTable('Challenges', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      challengeType: {
        type: Sequelize.ENUM(
          'weighted_backpack',
          'period_clothing',
          'distance',
          'time',
        ),
        allowNull: false,
      },
      pointsReward: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      difficultyMultiplier: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 1.0,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create TreasureHunts table
    await queryInterface.createTable('TreasureHunts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      parcoursId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Parcours',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      targetObject: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
      },
      scanRadiusMeters: {
        type: Sequelize.INTEGER,
        defaultValue: 50,
      },
      pointsReward: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      qrCode: {
        type: Sequelize.STRING(255),
        unique: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create Rewards table
    await queryInterface.createTable('Rewards', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      pointsCost: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      rewardType: {
        type: Sequelize.ENUM('discount', 'gift', 'badge', 'premium_content'),
        allowNull: false,
      },
      partnerName: {
        type: Sequelize.STRING(255),
      },
      stockQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      imageUrl: {
        type: Sequelize.STRING(500),
      },
      isAvailable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create UserActivities table
    await queryInterface.createTable('UserActivities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      parcoursId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Parcours',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      activityType: {
        type: Sequelize.ENUM('walking', 'running', 'cycling'),
        defaultValue: 'walking',
      },
      startDatetime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      endDatetime: {
        type: Sequelize.DATE,
      },
      distanceCoveredKm: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      pointsEarned: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('in_progress', 'completed', 'abandoned'),
        defaultValue: 'in_progress',
      },
      averageSpeed: {
        type: Sequelize.DECIMAL(5, 2),
      },
      gpxTraceUrl: {
        type: Sequelize.STRING(500),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create UserPOIVisits table
    await queryInterface.createTable('UserPOIVisits', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      poiId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PointOfInterests',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      activityId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'UserActivities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      visitDatetime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      scannedQr: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      listenedAudio: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      pointsEarned: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create UserQuizAttempts table
    await queryInterface.createTable('UserQuizAttempts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quizId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Quizzes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      pointsEarned: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      timeTakenSeconds: {
        type: Sequelize.INTEGER,
      },
      attemptDatetime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create UserChallengeProgresses table
    await queryInterface.createTable('UserChallengeProgresses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      challengeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Challenges',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      activityId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'UserActivities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('in_progress', 'completed', 'failed'),
        defaultValue: 'in_progress',
      },
      pointsEarned: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      startDatetime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      endDatetime: {
        type: Sequelize.DATE,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create UserTreasureFounds table
    await queryInterface.createTable('UserTreasureFounds', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      treasureId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'TreasureHunts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      foundDatetime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      pointsEarned: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create UserRewardRedeemeds table
    await queryInterface.createTable('UserRewardRedeemeds', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      rewardId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Rewards',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      redemptionDatetime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      pointsSpent: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'claimed', 'expired'),
        defaultValue: 'pending',
      },
      redemptionCode: {
        type: Sequelize.STRING(100),
        unique: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create HistoricalBattalions table
    await queryInterface.createTable('HistoricalBattalions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      militaryUnit: {
        type: Sequelize.STRING(255),
      },
      period: {
        type: Sequelize.STRING(100),
      },
      description: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create BattalionRoutes table
    await queryInterface.createTable('BattalionRoutes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      battalionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'HistoricalBattalions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      parcoursId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Parcours',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      routeDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      historicalContext: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create indexes for better query performance
    await queryInterface.addIndex('Users', ['email']);
    await queryInterface.addIndex('Users', ['username']);
    await queryInterface.addIndex('PointOfInterests', ['parcoursId']);
    await queryInterface.addIndex('PointOfInterests', ['qrCode']);
    await queryInterface.addIndex('ParcoursPodcasts', ['parcoursId']);
    await queryInterface.addIndex('ParcoursPodcasts', ['podcastId']);
    await queryInterface.addIndex('Questions', ['quizId']);
    await queryInterface.addIndex('Answers', ['questionId']);
    await queryInterface.addIndex('ParcoursQuizzes', ['parcoursId']);
    await queryInterface.addIndex('ParcoursQuizzes', ['quizId']);
    await queryInterface.addIndex('TreasureHunts', ['parcoursId']);
    await queryInterface.addIndex('TreasureHunts', ['qrCode']);
    await queryInterface.addIndex('UserActivities', ['userId']);
    await queryInterface.addIndex('UserActivities', ['parcoursId']);
    await queryInterface.addIndex('UserPOIVisits', ['userId']);
    await queryInterface.addIndex('UserPOIVisits', ['poiId']);
    await queryInterface.addIndex('UserQuizAttempts', ['userId']);
    await queryInterface.addIndex('UserQuizAttempts', ['quizId']);
    await queryInterface.addIndex('UserChallengeProgresses', ['userId']);
    await queryInterface.addIndex('UserChallengeProgresses', ['challengeId']);
    await queryInterface.addIndex('UserTreasureFounds', ['userId']);
    await queryInterface.addIndex('UserTreasureFounds', ['treasureId']);
    await queryInterface.addIndex('UserRewardRedeemeds', ['userId']);
    await queryInterface.addIndex('UserRewardRedeemeds', ['rewardId']);
    await queryInterface.addIndex('BattalionRoutes', ['battalionId']);
    await queryInterface.addIndex('BattalionRoutes', ['parcoursId']);
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order to respect foreign key constraints
    await queryInterface.dropTable('BattalionRoutes');
    await queryInterface.dropTable('HistoricalBattalions');
    await queryInterface.dropTable('UserRewardRedeemeds');
    await queryInterface.dropTable('UserTreasureFounds');
    await queryInterface.dropTable('UserChallengeProgresses');
    await queryInterface.dropTable('UserQuizAttempts');
    await queryInterface.dropTable('UserPOIVisits');
    await queryInterface.dropTable('UserActivities');
    await queryInterface.dropTable('Rewards');
    await queryInterface.dropTable('TreasureHunts');
    await queryInterface.dropTable('Challenges');
    await queryInterface.dropTable('ParcoursQuizzes');
    await queryInterface.dropTable('Answers');
    await queryInterface.dropTable('Questions');
    await queryInterface.dropTable('Quizzes');
    await queryInterface.dropTable('ParcoursPodcasts');
    await queryInterface.dropTable('Podcasts');
    await queryInterface.dropTable('PointOfInterests');
    await queryInterface.dropTable('Parcours');
    await queryInterface.dropTable('Users');
  },
};
