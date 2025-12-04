# CASCADE Delete Configuration

This document outlines all the CASCADE delete configurations that have been implemented to prevent orphan records in the database.

## Overview

All foreign key relationships have been configured with `onDelete: 'CASCADE'` to ensure that when a parent entity is deleted, all related child entities are automatically deleted from the database.

## CASCADE Configurations by Entity

### 1. Parcours (Parent Entity)

When a Parcours is deleted, the following child entities are automatically deleted:

- **PointOfInterest** (POI)
  - File: `src/modules/poi/entities/point-of-interest.entity.ts`
  - Foreign Key: `parcoursId`
  - Configuration: `onDelete: 'CASCADE'`

- **UserActivity**
  - File: `src/modules/activity/entities/user-activity.entity.ts`
  - Foreign Key: `parcoursId`
  - Configuration: `onDelete: 'CASCADE'`

- **TreasureHunt**
  - File: `src/modules/treasure-hunt/entities/treasure-hunt.entity.ts`
  - Foreign Key: `parcoursId`
  - Configuration: `onDelete: 'CASCADE'`

- **BattalionRoute**
  - File: `src/modules/historical/entities/battalion-route.entity.ts`
  - Foreign Key: `parcoursId`
  - Configuration: `onDelete: 'CASCADE'`

- **ParcoursPodcast** (junction table)
  - File: `src/modules/parcours/entities/parcours-podcast.entity.ts`
  - Foreign Key: `parcoursId`
  - Configuration: `onDelete: 'CASCADE'`

- **ParcoursQuiz** (junction table)
  - File: `src/modules/parcours/entities/parcours-quiz.entity.ts`
  - Foreign Key: `parcoursId`
  - Configuration: `onDelete: 'CASCADE'`

### 2. Quiz (Parent Entity)

When a Quiz is deleted, the following child entities are automatically deleted:

- **Question**
  - File: `src/modules/quiz/entities/question.entity.ts`
  - Foreign Key: `quizId`
  - Configuration: `onDelete: 'CASCADE'`
  - **Note**: Questions also cascade delete their Answers

- **UserQuizAttempt**
  - File: `src/modules/quiz/entities/user-quiz-attempt.entity.ts`
  - Foreign Key: `quizId`
  - Configuration: `onDelete: 'CASCADE'`

- **ParcoursQuiz** (junction table)
  - File: `src/modules/parcours/entities/parcours-quiz.entity.ts`
  - Foreign Key: `quizId`
  - Configuration: `onDelete: 'CASCADE'`

### 3. Question (Parent Entity)

When a Question is deleted, the following child entities are automatically deleted:

- **Answer**
  - File: `src/modules/quiz/entities/answer.entity.ts`
  - Foreign Key: `questionId`
  - Configuration: `onDelete: 'CASCADE'`

### 4. User (Parent Entity)

When a User is deleted, the following child entities are automatically deleted:

- **UserActivity**
  - File: `src/modules/activity/entities/user-activity.entity.ts`
  - Foreign Key: `userId`
  - Configuration: `onDelete: 'CASCADE'`

- **UserPOIVisit**
  - File: `src/modules/activity/entities/user-poi-visit.entity.ts`
  - Foreign Key: `userId`
  - Configuration: `onDelete: 'CASCADE'`

- **UserQuizAttempt**
  - File: `src/modules/quiz/entities/user-quiz-attempt.entity.ts`
  - Foreign Key: `userId`
  - Configuration: `onDelete: 'CASCADE'`

- **UserChallengeProgress**
  - File: `src/modules/challenge/entities/user-challenge-progress.entity.ts`
  - Foreign Key: `userId`
  - Configuration: `onDelete: 'CASCADE'`

- **UserTreasureFound**
  - File: `src/modules/treasure-hunt/entities/user-treasure-found.entity.ts`
  - Foreign Key: `userId`
  - Configuration: `onDelete: 'CASCADE'`

- **UserBadge**
  - File: `src/modules/badge/entities/user-badge.entity.ts`
  - Foreign Key: `userId`
  - Configuration: `onDelete: 'CASCADE'`

- **UserRewardRedeemed**
  - File: `src/modules/reward/entities/user-reward-redeemed.entity.ts`
  - Foreign Key: `userId`
  - Configuration: `onDelete: 'CASCADE'`

### 5. PointOfInterest (Parent Entity)

When a POI is deleted, the following child entities are automatically deleted:

- **UserPOIVisit**
  - File: `src/modules/activity/entities/user-poi-visit.entity.ts`
  - Foreign Key: `poiId`
  - Configuration: `onDelete: 'CASCADE'`

### 6. UserActivity (Parent Entity)

When a UserActivity is deleted, the following child entities are automatically deleted:

- **UserPOIVisit**
  - File: `src/modules/activity/entities/user-poi-visit.entity.ts`
  - Foreign Key: `activityId`
  - Configuration: `onDelete: 'CASCADE'`

- **UserChallengeProgress**
  - File: `src/modules/challenge/entities/user-challenge-progress.entity.ts`
  - Foreign Key: `activityId`
  - Configuration: `onDelete: 'CASCADE'`

### 7. TreasureHunt (Parent Entity)

When a TreasureHunt is deleted, the following child entities are automatically deleted:

- **UserTreasureFound**
  - File: `src/modules/treasure-hunt/entities/user-treasure-found.entity.ts`
  - Foreign Key: `treasureId`
  - Configuration: `onDelete: 'CASCADE'`

### 8. Challenge (Parent Entity)

When a Challenge is deleted, the following child entities are automatically deleted:

- **UserChallengeProgress**
  - File: `src/modules/challenge/entities/user-challenge-progress.entity.ts`
  - Foreign Key: `challengeId`
  - Configuration: `onDelete: 'CASCADE'`

### 9. Badge (Parent Entity)

When a Badge is deleted, the following child entities are automatically deleted:

- **UserBadge**
  - File: `src/modules/badge/entities/user-badge.entity.ts`
  - Foreign Key: `badgeId`
  - Configuration: `onDelete: 'CASCADE'`

### 10. Reward (Parent Entity)

When a Reward is deleted, the following child entities are automatically deleted:

- **UserRewardRedeemed**
  - File: `src/modules/reward/entities/user-reward-redeemed.entity.ts`
  - Foreign Key: `rewardId`
  - Configuration: `onDelete: 'CASCADE'`

### 11. Podcast (Parent Entity)

When a Podcast is deleted, the following child entities are automatically deleted:

- **ParcoursPodcast** (junction table)
  - File: `src/modules/parcours/entities/parcours-podcast.entity.ts`
  - Foreign Key: `podcastId`
  - Configuration: `onDelete: 'CASCADE'`

### 12. HistoricalBattalion (Parent Entity)

When a HistoricalBattalion is deleted, the following child entities are automatically deleted:

- **BattalionRoute**
  - File: `src/modules/historical/entities/battalion-route.entity.ts`
  - Foreign Key: `battalionId`
  - Configuration: `onDelete: 'CASCADE'`

## Testing

CASCADE delete functionality has been tested in the following test files:

### Parcours CASCADE Tests
**File**: `test/parcours.e2e-spec.ts`

Test cases:
1. ✅ Deleting Parcours automatically deletes POIs
2. ✅ Deleting Parcours automatically deletes UserActivities

### Quiz CASCADE Tests
**File**: `test/quiz.e2e-spec.ts`

Test cases:
1. ✅ Deleting Quiz automatically deletes Questions and Answers

## Cascade Chain Examples

### Example 1: Deleting a Parcours
```
Parcours (deleted)
├── PointOfInterest (CASCADE deleted)
│   └── UserPOIVisit (CASCADE deleted)
├── UserActivity (CASCADE deleted)
│   ├── UserPOIVisit (CASCADE deleted)
│   └── UserChallengeProgress (CASCADE deleted)
├── TreasureHunt (CASCADE deleted)
│   └── UserTreasureFound (CASCADE deleted)
├── BattalionRoute (CASCADE deleted)
├── ParcoursPodcast (CASCADE deleted)
└── ParcoursQuiz (CASCADE deleted)
```

### Example 2: Deleting a Quiz
```
Quiz (deleted)
├── Question (CASCADE deleted)
│   └── Answer (CASCADE deleted)
├── UserQuizAttempt (CASCADE deleted)
└── ParcoursQuiz (CASCADE deleted)
```

### Example 3: Deleting a User
```
User (deleted)
├── UserActivity (CASCADE deleted)
│   ├── UserPOIVisit (CASCADE deleted)
│   └── UserChallengeProgress (CASCADE deleted)
├── UserPOIVisit (CASCADE deleted)
├── UserQuizAttempt (CASCADE deleted)
├── UserChallengeProgress (CASCADE deleted)
├── UserTreasureFound (CASCADE deleted)
├── UserBadge (CASCADE deleted)
└── UserRewardRedeemed (CASCADE deleted)
```

## Benefits

1. **Data Integrity**: No orphan records left in the database
2. **Automatic Cleanup**: Related data is automatically removed when parent is deleted
3. **Simplified Code**: No need to manually delete child entities in service methods
4. **Database-Level Enforcement**: CASCADE is enforced at the database level, not just application level
5. **Performance**: Single delete operation handled efficiently by the database

## Important Notes

1. All CASCADE configurations are enforced at the database level through Sequelize ORM
2. When deleting a parent entity, all dependent child entities are removed automatically
3. The CASCADE delete is transactional - if any part fails, the entire operation rolls back
4. Always be cautious when deleting parent entities as CASCADE deletes are irreversible
5. For soft deletes, consider implementing a `deletedAt` timestamp instead of actual deletion

## Verification

To verify CASCADE delete works correctly:

1. Run the E2E tests:
   ```bash
   npm run test:e2e -- parcours.e2e-spec.ts
   npm run test:e2e -- quiz.e2e-spec.ts
   ```

2. Check database after parent deletion:
   - All child records should be automatically removed
   - No orphan foreign keys should remain

## Migration Considerations

If you're migrating from a database without CASCADE delete configurations:

1. Backup your database before applying changes
2. Run database synchronization: `npm run migration:sync`
3. Verify CASCADE constraints are properly created in the database schema
4. Test deletion operations in a staging environment first

## Last Updated

December 4, 2025
