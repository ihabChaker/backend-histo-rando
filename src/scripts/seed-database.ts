import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User } from '../modules/users/entities/user.entity';
import { Parcours } from '../modules/parcours/entities/parcours.entity';
import { PointOfInterest } from '../modules/poi/entities/point-of-interest.entity';
import { Quiz } from '../modules/quiz/entities/quiz.entity';
import { Question } from '../modules/quiz/entities/question.entity';
import { Answer } from '../modules/quiz/entities/answer.entity';
import { Challenge } from '../modules/challenge/entities/challenge.entity';
import { Badge } from '../modules/badge/entities/badge.entity';
import { Reward } from '../modules/reward/entities/reward.entity';
import { TreasureHunt } from '../modules/treasure-hunt/entities/treasure-hunt.entity';
import { TreasureItem } from '../modules/treasure-hunt/entities/treasure-item.entity';
import { HistoricalBattalion } from '../modules/historical/entities/historical-battalion.entity';
import { BattalionRoute } from '../modules/historical/entities/battalion-route.entity';
import { Podcast } from '../modules/media/entities/podcast.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function clearDatabase() {
  console.log('Clearing existing data...');

  // Clear in correct order (child tables first due to foreign keys)
  await Answer.destroy({ where: {}, force: true });
  await Question.destroy({ where: {}, force: true });
  await Quiz.destroy({ where: {}, force: true });
  await TreasureItem.destroy({ where: {}, force: true });
  await PointOfInterest.destroy({ where: {}, force: true });
  await BattalionRoute.destroy({ where: {}, force: true });
  await HistoricalBattalion.destroy({ where: {}, force: true });
  await TreasureHunt.destroy({ where: {}, force: true });
  await Challenge.destroy({ where: {}, force: true });
  await Badge.destroy({ where: {}, force: true });
  await Reward.destroy({ where: {}, force: true });
  await Podcast.destroy({ where: {}, force: true });
  await Parcours.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });

  console.log('Database cleared successfully!');
}

async function seedUsers() {
  console.log('Seeding users...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    {
      email: 'admin@historando.com',
      username: 'admin',
      passwordHash,
      firstName: 'Admin',
      lastName: 'HistoRando',
      role: 'admin',
      isPmr: false,
      points: 0,
    },
    {
      email: 'jean.dupont@example.com',
      username: 'jean_dupont',
      passwordHash,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'user',
      isPmr: false,
      points: 350,
    },
    {
      email: 'marie.martin@example.com',
      username: 'marie_martin',
      passwordHash,
      firstName: 'Marie',
      lastName: 'Martin',
      role: 'user',
      isPmr: true,
      points: 520,
    },
    {
      email: 'pierre.bernard@example.com',
      username: 'pierre_b',
      passwordHash,
      firstName: 'Pierre',
      lastName: 'Bernard',
      role: 'user',
      isPmr: false,
      points: 180,
    },
    {
      email: 'sophie.durand@example.com',
      username: 'sophie_d',
      passwordHash,
      firstName: 'Sophie',
      lastName: 'Durand',
      role: 'user',
      isPmr: false,
      points: 720,
    },
  ];

  const createdUsers = await User.bulkCreate(users);
  console.log(`Created ${createdUsers.length} users`);
  return createdUsers;
}

async function seedParcours() {
  console.log('Seeding parcours...');

  const parcoursList = [
    {
      name: 'Chemin des Poilus - Verdun',
      description:
        'Parcours historique retraçant les batailles de Verdun de 1916. Découvrez les lieux de mémoire, les tranchées et les fortifications qui ont marqué cette période.',
      difficultyLevel: 'medium',
      estimatedDuration: 180,
      distanceKm: 12.5,
      isPmrAccessible: false,
      startingPointLat: 49.1594,
      startingPointLon: 5.3878,
      endPointLat: 49.1623,
      endPointLon: 5.4012,
      historicalTheme: 'World War I',
      geoJsonPath: JSON.stringify({
        type: 'LineString',
        coordinates: [
          [5.3878, 49.1594],
          [5.3912, 49.1601],
          [5.3956, 49.1608],
          [5.4012, 49.1623],
        ],
      }),
      imageUrl: 'https://example.com/verdun.jpg',
      isActive: true,
    },
    {
      name: 'Sentier du Débarquement - Normandie',
      description:
        "Revivez le Débarquement du 6 juin 1944 à travers ce parcours le long des plages d'Omaha Beach. Sites historiques, bunkers et monuments commémoratifs.",
      difficultyLevel: 'easy',
      estimatedDuration: 120,
      distanceKm: 8.0,
      isPmrAccessible: true,
      startingPointLat: 49.3708,
      startingPointLon: -0.8649,
      endPointLat: 49.3751,
      endPointLon: -0.8512,
      historicalTheme: 'World War II',
      geoJsonPath: JSON.stringify({
        type: 'LineString',
        coordinates: [
          [-0.8649, 49.3708],
          [-0.8612, 49.372],
          [-0.8567, 49.3735],
          [-0.8512, 49.3751],
        ],
      }),
      imageUrl: 'https://example.com/normandie.jpg',
      isActive: true,
    },
    {
      name: 'Route Napoléonienne - Austerlitz',
      description:
        "Explorez les champs de bataille d'Austerlitz où Napoléon remporta sa plus grande victoire en 1805. Monuments, musée et points stratégiques.",
      difficultyLevel: 'hard',
      estimatedDuration: 240,
      distanceKm: 18.0,
      isPmrAccessible: false,
      startingPointLat: 49.1323,
      startingPointLon: 16.7644,
      endPointLat: 49.1456,
      endPointLon: 16.7892,
      historicalTheme: 'Napoleonic Wars',
      imageUrl: 'https://example.com/austerlitz.jpg',
      isActive: true,
    },
    {
      name: 'Voie de la Liberté - Alsace',
      description:
        "Suivez le chemin de la libération de l'Alsace en 1944-1945. Bornes commémoratives, musées et villages historiques jalonnent ce parcours.",
      difficultyLevel: 'easy',
      estimatedDuration: 150,
      distanceKm: 10.5,
      isPmrAccessible: true,
      startingPointLat: 48.5734,
      startingPointLon: 7.7521,
      endPointLat: 48.5891,
      endPointLon: 7.7834,
      historicalTheme: 'World War II',
      imageUrl: 'https://example.com/alsace.jpg',
      isActive: true,
    },
  ];

  const createdParcours = await Parcours.bulkCreate(parcoursList);
  console.log(`Created ${createdParcours.length} parcours`);
  return createdParcours;
}

async function seedPOIs(parcoursList: Parcours[]) {
  console.log('Seeding points of interest...');

  const pois = [
    // Verdun POIs
    {
      name: 'Fort de Douaumont',
      description:
        'Le plus grand et le plus haut des forts de Verdun, théâtre de combats acharnés en 1916.',
      latitude: 49.1987,
      longitude: 5.4321,
      poiType: 'monument',
      parcoursId: parcoursList[0].id,
      historicalPeriod: 'World War I (1885-1916)',
      orderInParcours: 1,
      imageUrl: 'https://example.com/douaumont.jpg',
      audioUrl: null,
      quizId: null,
      podcastId: null,
      qrCode: null,
    },
    {
      name: 'Ossuaire de Douaumont',
      description:
        'Monument commémoratif abritant les restes de 130 000 soldats inconnus français et allemands.',
      latitude: 49.2012,
      longitude: 5.4389,
      poiType: 'memorial',
      parcoursId: parcoursList[0].id,
      historicalPeriod: 'World War I (1932)',
      orderInParcours: 2,
      imageUrl: 'https://example.com/ossuaire.jpg',
      audioUrl: null,
      quizId: null,
      podcastId: null,
      qrCode: null,
    },
    {
      name: 'Tranchée des Baïonnettes',
      description:
        "Site emblématique où des soldats furent ensevelis vivants lors d'un bombardement.",
      latitude: 49.1876,
      longitude: 5.4156,
      poiType: 'monument',
      parcoursId: parcoursList[0].id,
      historicalPeriod: 'World War I (1916)',
      orderInParcours: 3,
      imageUrl: 'https://example.com/baionnettes.jpg',
      audioUrl: null,
      quizId: null,
      podcastId: null,
      qrCode: null,
    },

    // Normandie POIs
    {
      name: 'Omaha Beach',
      description:
        'La plage la plus célèbre du Débarquement, théâtre de combats sanglants le 6 juin 1944.',
      latitude: 49.372,
      longitude: -0.8698,
      poiType: 'beach',
      parcoursId: parcoursList[1].id,
      historicalPeriod: 'World War II (1944)',
      orderInParcours: 1,
      imageUrl: 'https://example.com/omaha.jpg',
      audioUrl: null,
      quizId: null,
      podcastId: null,
      qrCode: null,
    },
    {
      name: 'Cimetière américain de Colleville',
      description:
        'Le plus grand cimetière militaire américain en Europe avec 9 387 tombes.',
      latitude: 49.3604,
      longitude: -0.8573,
      poiType: 'memorial',
      parcoursId: parcoursList[1].id,
      historicalPeriod: 'World War II (1956)',
      orderInParcours: 2,
      imageUrl: 'https://example.com/colleville.jpg',
      audioUrl: null,
      quizId: null,
      podcastId: null,
      qrCode: null,
    },
    {
      name: 'Pointe du Hoc',
      description:
        "Promontoire fortifié pris d'assaut par les Rangers américains le 6 juin 1944.",
      latitude: 49.3969,
      longitude: -0.9889,
      poiType: 'bunker',
      parcoursId: parcoursList[1].id,
      historicalPeriod: 'World War II (1944)',
      orderInParcours: 3,
      imageUrl: 'https://example.com/pointe-du-hoc.jpg',
      audioUrl: null,
      quizId: null,
      podcastId: null,
      qrCode: null,
    },

    // Austerlitz POIs
    {
      name: 'Pratzen Heights',
      description:
        "Point culminant du champ de bataille d'Austerlitz, clé de la victoire napoléonienne.",
      latitude: 49.1389,
      longitude: 16.7734,
      poiType: 'monument',
      parcoursId: parcoursList[2].id,
      historicalPeriod: 'Napoleonic Wars (1805)',
      orderInParcours: 1,
      imageUrl: 'https://example.com/pratzen.jpg',
      audioUrl: null,
      quizId: null,
      podcastId: null,
      qrCode: null,
    },
    {
      name: 'Monument de la Paix',
      description: 'Monument commémorant la bataille des Trois Empereurs.',
      latitude: 49.1412,
      longitude: 16.7823,
      poiType: 'memorial',
      parcoursId: parcoursList[2].id,
      historicalPeriod: 'Napoleonic Wars (1912)',
      orderInParcours: 2,
      imageUrl: 'https://example.com/monument-paix.jpg',
      audioUrl: null,
      quizId: null,
      podcastId: null,
      qrCode: null,
    },
  ];

  const createdPOIs = await PointOfInterest.bulkCreate(pois);
  console.log(`Created ${createdPOIs.length} points of interest`);
  return createdPOIs;
}

async function seedQuizzes() {
  console.log('Seeding quizzes...');

  const quizzes = [
    {
      title: 'La Bataille de Verdun',
      description:
        "Testez vos connaissances sur l'une des batailles les plus meurtrières de la Première Guerre mondiale.",
      difficulty: 'medium',
      pointsReward: 50,
      isActive: true,
    },
    {
      title: 'Le Débarquement de Normandie',
      description: "Que savez-vous du Jour J et de l'opération Overlord ?",
      difficulty: 'easy',
      pointsReward: 30,
      isActive: true,
    },
    {
      title: 'Napoléon Bonaparte',
      description:
        "Quiz sur la vie et les campagnes de l'Empereur des Français.",
      difficulty: 'hard',
      pointsReward: 75,
      isActive: true,
    },
  ];

  const createdQuizzes = await Quiz.bulkCreate(quizzes);
  console.log(`Created ${createdQuizzes.length} quizzes`);
  return createdQuizzes;
}

async function seedQuestions(quizzes: Quiz[]) {
  console.log('Seeding questions and answers...');

  const questionsData = [
    // Verdun Quiz
    {
      quizId: quizzes[0].id,
      questionText: 'En quelle année a eu lieu la bataille de Verdun ?',
      correctAnswer: '1916',
      points: 10,
      questionOrder: 1,
      answers: [
        {
          answerText: '1914',
          isCorrect: false,
        },
        {
          answerText: '1916',
          isCorrect: true,
        },
        {
          answerText: '1918',
          isCorrect: false,
        },
        {
          answerText: '1917',
          isCorrect: false,
        },
      ],
    },
    {
      quizId: quizzes[0].id,
      questionText: "Quel était le mot d'ordre français à Verdun ?",
      correctAnswer: 'Ils ne passeront pas',
      points: 10,
      questionOrder: 2,
      answers: [
        {
          answerText: "À l'attaque !",
          isCorrect: false,
        },
        {
          answerText: 'Ils ne passeront pas',
          isCorrect: true,
        },
        {
          answerText: 'Pour la patrie',
          isCorrect: false,
        },
        {
          answerText: 'Tenir coûte que coûte',
          isCorrect: false,
        },
      ],
    },

    // Normandie Quiz
    {
      quizId: quizzes[1].id,
      questionText: 'Quelle était la date du Débarquement de Normandie ?',
      correctAnswer: '6 juin 1944',
      points: 10,
      questionOrder: 1,
      answers: [
        {
          answerText: '5 juin 1944',
          isCorrect: false,
        },
        {
          answerText: '6 juin 1944',
          isCorrect: true,
        },
        {
          answerText: '7 juin 1944',
          isCorrect: false,
        },
        {
          answerText: '8 mai 1945',
          isCorrect: false,
        },
      ],
    },
    {
      quizId: quizzes[1].id,
      questionText:
        'Combien de plages principales composaient le secteur de débarquement ?',
      correctAnswer: '5',
      points: 10,
      questionOrder: 2,
      answers: [
        {
          answerText: '3',
          isCorrect: false,
        },
        {
          answerText: '5',
          isCorrect: true,
        },
        {
          answerText: '7',
          isCorrect: false,
        },
        { answerText: '10', isCorrect: false },
      ],
    },

    // Napoléon Quiz
    {
      quizId: quizzes[2].id,
      questionText: 'En quelle année Napoléon est-il devenu Empereur ?',
      correctAnswer: '1804',
      points: 15,
      questionOrder: 1,
      answers: [
        {
          answerText: '1799',
          isCorrect: false,
        },
        {
          answerText: '1804',
          isCorrect: true,
        },
        {
          answerText: '1805',
          isCorrect: false,
        },
        {
          answerText: '1800',
          isCorrect: false,
        },
      ],
    },
  ];

  for (const qData of questionsData) {
    const { answers, ...questionInfo } = qData;
    const question = await Question.create(questionInfo);

    const answersWithQuestionId = answers.map((a) => ({
      ...a,
      questionId: question.id,
    }));

    await Answer.bulkCreate(answersWithQuestionId);
  }

  console.log(`Created ${questionsData.length} questions with answers`);
}

async function seedChallenges() {
  console.log('Seeding challenges...');

  const challenges = [
    {
      name: 'Défi du Sac Lesté',
      description:
        "Complétez un parcours avec un sac à dos lesté pour simuler l'équipement militaire",
      challengeType: 'weighted_backpack',
      pointsReward: 100,
      difficultyMultiplier: 1.5,
      isActive: true,
    },
    {
      name: "Marche en Tenue d'Époque",
      description:
        "Effectuez un parcours en portant une tenue d'époque historique",
      challengeType: 'period_clothing',
      pointsReward: 150,
      difficultyMultiplier: 1.3,
      isActive: true,
    },
    {
      name: 'Marathon Historique',
      description: 'Parcourez 50 km au total sur tous vos parcours',
      challengeType: 'distance',
      pointsReward: 200,
      difficultyMultiplier: 2.0,
      isActive: true,
    },
    {
      name: 'Course Contre la Montre',
      description:
        'Complétez un parcours en moins de temps que la durée estimée',
      challengeType: 'time',
      pointsReward: 250,
      difficultyMultiplier: 1.8,
      isActive: true,
    },
    {
      name: 'Ultra Endurant',
      description: 'Marchez pendant 4 heures consécutives sur les parcours',
      challengeType: 'time',
      pointsReward: 300,
      difficultyMultiplier: 2.5,
      isActive: true,
    },
  ];

  const createdChallenges = await Challenge.bulkCreate(challenges);
  console.log(`Created ${createdChallenges.length} challenges`);
  return createdChallenges;
}

async function seedBadges() {
  console.log('Seeding badges...');

  const badges = [
    {
      name: 'Débutant',
      description: 'Complétez votre premier parcours',
      iconUrl: 'https://example.com/badge-debutant.png',
      requirement: 'Terminer 1 parcours',
      points: 50,
      rarity: 'commun',
      isActive: true,
    },
    {
      name: 'Explorateur',
      description: "Visitez 20 points d'intérêt",
      iconUrl: 'https://example.com/badge-explorateur.png',
      requirement: 'Visiter 20 POI',
      points: 100,
      rarity: 'rare',
      isActive: true,
    },
    {
      name: 'Historien',
      description: 'Réussissez tous les quiz disponibles',
      iconUrl: 'https://example.com/badge-historien.png',
      requirement: 'Réussir tous les quiz',
      points: 150,
      rarity: 'épique',
      isActive: true,
    },
    {
      name: 'Légende',
      description: 'Complétez tous les défis disponibles',
      iconUrl: 'https://example.com/badge-legende.png',
      requirement: 'Compléter tous les défis',
      points: 300,
      rarity: 'légendaire',
      isActive: true,
    },
    {
      name: 'Marathon',
      description: 'Parcourez 100 km au total',
      iconUrl: 'https://example.com/badge-marathon.png',
      requirement: 'Marcher 100 km',
      points: 200,
      rarity: 'épique',
      isActive: true,
    },
  ];

  const createdBadges = await Badge.bulkCreate(badges);
  console.log(`Created ${createdBadges.length} badges`);
  return createdBadges;
}

async function seedRewards() {
  console.log('Seeding rewards...');

  const rewards = [
    {
      name: 'Guide Historique Premium',
      description: 'Accès illimité aux guides audio premium pendant 1 mois',
      rewardType: 'premium_content',
      pointsCost: 500,
      stockQuantity: 999,
      imageUrl: 'https://example.com/reward-premium.png',
      isAvailable: true,
    },
    {
      name: 'T-Shirt HistoRando',
      description: 'T-shirt officiel HistoRando avec logo brodé',
      rewardType: 'gift',
      pointsCost: 800,
      stockQuantity: 50,
      imageUrl: 'https://example.com/reward-tshirt.png',
      isAvailable: true,
    },
    {
      name: 'Casquette HistoRando',
      description: 'Casquette officielle avec broderie logo HistoRando',
      rewardType: 'gift',
      pointsCost: 600,
      stockQuantity: 75,
      imageUrl: 'https://example.com/reward-cap.png',
      isAvailable: true,
    },
    {
      name: 'Livre "Grandes Batailles"',
      description: "Ouvrage illustré sur les grandes batailles de l'histoire",
      rewardType: 'gift',
      pointsCost: 1200,
      stockQuantity: 20,
      imageUrl: 'https://example.com/reward-livre.png',
      isAvailable: true,
    },
    {
      name: 'Carte Historique Ancienne',
      description:
        "Reproduction authentique d'une carte historique du 18ème siècle",
      rewardType: 'gift',
      pointsCost: 900,
      stockQuantity: 30,
      imageUrl: 'https://example.com/reward-map.png',
      isAvailable: true,
    },
    {
      name: 'Visite Guidée VIP',
      description: "Visite guidée privée d'un site historique au choix",
      rewardType: 'discount',
      pointsCost: 2000,
      stockQuantity: 10,
      imageUrl: 'https://example.com/reward-vip.png',
      isAvailable: true,
    },
    {
      name: 'Atelier Histoire Vivante',
      description: 'Participation à un atelier de reconstitution historique',
      rewardType: 'discount',
      pointsCost: 1500,
      stockQuantity: 15,
      imageUrl: 'https://example.com/reward-workshop.png',
      isAvailable: true,
    },
    {
      name: 'Badge Exclusif "Explorateur"',
      description: 'Badge numérique ultra-rare pour les vrais explorateurs',
      rewardType: 'badge',
      pointsCost: 300,
      stockQuantity: 999,
      imageUrl: 'https://example.com/reward-badge.png',
      isAvailable: true,
    },
    {
      name: 'Pack Stickers Historiques',
      description: 'Collection de 20 stickers sur des événements historiques',
      rewardType: 'gift',
      pointsCost: 400,
      stockQuantity: 100,
      imageUrl: 'https://example.com/reward-stickers.png',
      isAvailable: true,
    },
    {
      name: 'Accès Musée Premium',
      description: "Pass annuel pour l'accès illimité aux musées partenaires",
      rewardType: 'premium_content',
      pointsCost: 2500,
      stockQuantity: 5,
      imageUrl: 'https://example.com/reward-museum.png',
      isAvailable: true,
    },
    {
      name: 'Livre Audio "Épopées Guerrières"',
      description: 'Collection de 10 livres audio sur les grandes épopées',
      rewardType: 'premium_content',
      pointsCost: 700,
      stockQuantity: 999,
      imageUrl: 'https://example.com/reward-audiobook.png',
      isAvailable: true,
    },
    {
      name: 'Gourde HistoRando',
      description: 'Gourde isotherme en acier inoxydable avec logo gravé',
      rewardType: 'gift',
      pointsCost: 550,
      stockQuantity: 60,
      imageUrl: 'https://example.com/reward-bottle.png',
      isAvailable: true,
    },
  ];

  const createdRewards = await Reward.bulkCreate(rewards);
  console.log(`Created ${createdRewards.length} rewards`);
  return createdRewards;
}

async function seedTreasureHunts(parcoursList: Parcours[]) {
  console.log('Seeding treasure hunts...');

  const treasures = [
    {
      name: 'Casque de Poilu',
      description:
        "Près du monument où reposent les braves, cherchez l'arbre centenaire qui a survécu aux combats.",
      targetObject: 'Casque Adrian WWI',
      latitude: 49.1678,
      longitude: 5.3945,
      parcoursId: parcoursList[0].id,
      scanRadiusMeters: 50,
      pointsReward: 150,
      qrCode: null,
      isActive: true,
    },
    {
      name: 'Médaille du Débarquement',
      description:
        'Là où les vagues rencontrent le sable, sous la falaise qui a vu tant de courage.',
      targetObject: 'Médaille commémorative D-Day',
      latitude: 49.3689,
      longitude: -0.8621,
      parcoursId: parcoursList[1].id,
      scanRadiusMeters: 50,
      pointsReward: 150,
      qrCode: null,
      isActive: true,
    },
    {
      name: 'Pièce Napoléonienne',
      description:
        "Au sommet de la colline où l'aigle a triomphé, cherchez près de la pierre gravée.",
      targetObject: "Napoléon d'or 1805",
      latitude: 49.1401,
      longitude: 16.7756,
      parcoursId: parcoursList[2].id,
      scanRadiusMeters: 50,
      pointsReward: 200,
      qrCode: null,
      isActive: true,
    },
  ];

  const createdTreasures = await TreasureHunt.bulkCreate(treasures);
  console.log(`Created ${createdTreasures.length} treasure hunts`);
  return createdTreasures;
}

async function seedTreasureItems(treasureHunts: TreasureHunt[]) {
  console.log('Seeding treasure items...');

  const items = [
    // Items for Casque de Poilu treasure
    {
      treasureHuntId: treasureHunts[0].id,
      itemName: 'Insigne du 137e RI',
      description: "Insigne de col du 137e Régiment d'Infanterie",
      imageUrl: 'https://example.com/insigne-137.jpg',
      pointsReward: 30,
      qrCode: uuidv4(),
    },
    {
      treasureHuntId: treasureHunts[0].id,
      itemName: "Bouton d'uniforme",
      description: "Bouton en laiton d'un uniforme de Poilu",
      imageUrl: 'https://example.com/bouton.jpg',
      pointsReward: 25,
      qrCode: uuidv4(),
    },
    {
      treasureHuntId: treasureHunts[0].id,
      itemName: 'Fragment de casque',
      description: 'Fragment du célèbre casque Adrian',
      imageUrl: 'https://example.com/casque-fragment.jpg',
      pointsReward: 40,
      qrCode: uuidv4(),
    },
    {
      treasureHuntId: treasureHunts[0].id,
      itemName: "Plaque d'identité",
      description: "Plaque d'identité militaire de 1916",
      imageUrl: 'https://example.com/plaque-identite.jpg',
      pointsReward: 35,
      qrCode: uuidv4(),
    },

    // Items for Médaille du Débarquement treasure
    {
      treasureHuntId: treasureHunts[1].id,
      itemName: 'Étoile de Bronze',
      description: 'Étoile de Bronze commémorative',
      imageUrl: 'https://example.com/etoile-bronze.jpg',
      pointsReward: 35,
      qrCode: uuidv4(),
    },
    {
      treasureHuntId: treasureHunts[1].id,
      itemName: 'Médaillon du Jour J',
      description: 'Médaillon gravé "D-Day 6 June 1944"',
      imageUrl: 'https://example.com/medaillon-dday.jpg',
      pointsReward: 40,
      qrCode: uuidv4(),
    },
    {
      treasureHuntId: treasureHunts[1].id,
      itemName: 'Insigne Airborne',
      description: 'Insigne de la 101st Airborne Division',
      imageUrl: 'https://example.com/airborne.jpg',
      pointsReward: 45,
      qrCode: uuidv4(),
    },

    // Items for Pièce Napoléonienne treasure
    {
      treasureHuntId: treasureHunts[2].id,
      itemName: "Napoléon d'Or",
      description: "Pièce napoléon d'or 20 francs de 1805",
      imageUrl: 'https://example.com/napoleon-or.jpg',
      pointsReward: 50,
      qrCode: uuidv4(),
    },
    {
      treasureHuntId: treasureHunts[2].id,
      itemName: 'Bouton de la Grande Armée',
      description: "Bouton d'uniforme de la Grande Armée",
      imageUrl: 'https://example.com/bouton-armee.jpg',
      pointsReward: 40,
      qrCode: uuidv4(),
    },
    {
      treasureHuntId: treasureHunts[2].id,
      itemName: "Médaille d'Austerlitz",
      description: 'Médaille commémorative de la bataille',
      imageUrl: 'https://example.com/medaille-austerlitz.jpg',
      pointsReward: 55,
      qrCode: uuidv4(),
    },
    {
      treasureHuntId: treasureHunts[2].id,
      itemName: 'Aigle Impériale',
      description: 'Petite aigle en bronze de régiment',
      imageUrl: 'https://example.com/aigle.jpg',
      pointsReward: 60,
      qrCode: uuidv4(),
    },
  ];

  const createdItems = await TreasureItem.bulkCreate(items);
  console.log(`Created ${createdItems.length} treasure items with QR codes`);
  return createdItems;
}

async function seedPodcasts(parcoursList: Parcours[]) {
  console.log('Seeding podcasts...');

  const podcasts = [
    {
      title: 'Les Voix de Verdun',
      description: 'Témoignages de soldats et récits de la bataille de Verdun',
      audioFileUrl: 'https://example.com/audio/verdun.mp3',
      durationSeconds: 1200,
      narrator: 'Jean-Pierre Durand',
      language: 'fr',
      thumbnailUrl: null,
    },
    {
      title: 'Le Jour le Plus Long',
      description: 'Récit heure par heure du Débarquement en Normandie',
      audioFileUrl: 'https://example.com/audio/dday.mp3',
      durationSeconds: 1800,
      narrator: 'Marie Leclerc',
      language: 'fr',
      thumbnailUrl: null,
    },
    {
      title: 'Napoléon à Austerlitz',
      description: 'La stratégie du génie militaire à Austerlitz',
      audioFileUrl: 'https://example.com/audio/austerlitz.mp3',
      durationSeconds: 1500,
      narrator: 'François Martin',
      language: 'fr',
      thumbnailUrl: null,
    },
  ];

  const createdPodcasts = await Podcast.bulkCreate(podcasts);
  console.log(`Created ${createdPodcasts.length} podcasts`);
  return createdPodcasts;
}

async function updatePOIsWithContent(
  pois: PointOfInterest[],
  quizzes: Quiz[],
  podcasts: Podcast[],
) {
  console.log('Linking POIs with quizzes and podcasts...');

  // Link some POIs with quizzes
  if (pois[0]) {
    await pois[0].update({ quizId: quizzes[0]?.id, qrCode: uuidv4() });
  }
  if (pois[3]) {
    await pois[3].update({ quizId: quizzes[1]?.id, qrCode: uuidv4() });
  }
  if (pois[6]) {
    await pois[6].update({ quizId: quizzes[2]?.id, qrCode: uuidv4() });
  }

  // Link some POIs with podcasts
  if (pois[1]) {
    await pois[1].update({ podcastId: podcasts[0]?.id, qrCode: uuidv4() });
  }
  if (pois[4]) {
    await pois[4].update({ podcastId: podcasts[1]?.id, qrCode: uuidv4() });
  }
  if (pois[7]) {
    await pois[7].update({ podcastId: podcasts[2]?.id, qrCode: uuidv4() });
  }

  // Add QR codes to remaining POIs
  for (let i = 0; i < pois.length; i++) {
    if (pois[i] && !pois[i].qrCode) {
      await pois[i].update({ qrCode: uuidv4() });
    }
  }

  console.log('POIs updated with content and QR codes');
}

async function seedBattalions() {
  console.log('Seeding historical battalions...');

  const battalions = [
    {
      name: '2e Division Blindée',
      country: 'France',
      militaryUnit: '2e DB (Leclerc)',
      period: '1943-1945',
      description:
        'Division blindée française commandée par le général Leclerc, célèbre pour la libération de Paris et de Strasbourg.',
    },
    {
      name: '101st Airborne Division',
      country: 'États-Unis',
      militaryUnit: '101e Division Aéroportée',
      period: '1942-1945',
      description:
        'Division d\'élite américaine, les "Screaming Eagles", qui participa au Débarquement de Normandie et à l\'opération Market Garden.',
    },
    {
      name: 'Régiment de Tirailleurs Sénégalais',
      country: 'France',
      militaryUnit: 'RTS',
      period: '1857-1960',
      description:
        'Unités coloniales françaises composées de soldats africains qui combattirent lors des deux guerres mondiales.',
    },
  ];

  const createdBattalions = await HistoricalBattalion.bulkCreate(battalions);
  console.log(`Created ${createdBattalions.length} battalions`);
  return createdBattalions;
}

async function seedBattalionRoutes(
  battalions: HistoricalBattalion[],
  parcoursList: Parcours[],
) {
  console.log('Seeding battalion routes...');

  const routes = [
    {
      battalionId: battalions[0].id,
      parcoursId: parcoursList[3].id,
      routeDate: new Date('1944-11-23'),
      historicalContext:
        'La 2e DB libère Strasbourg le 23 novembre 1944, accomplissant le serment de Koufra.',
    },
    {
      battalionId: battalions[1].id,
      parcoursId: parcoursList[1].id,
      routeDate: new Date('1944-06-06'),
      historicalContext:
        'La 101e aéroportée saute sur Sainte-Mère-Église durant la nuit du 5 au 6 juin 1944.',
    },
  ];

  const createdRoutes = await BattalionRoute.bulkCreate(routes);
  console.log(`Created ${createdRoutes.length} battalion routes`);
  return createdRoutes;
}

async function bootstrap() {
  console.log('🌱 Starting database seeding...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Ask for confirmation
    console.log(
      '⚠️  WARNING: This will DELETE all existing data and create new seed data!',
    );
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Clear existing data
    await clearDatabase();

    // Seed in order (respecting foreign key dependencies)
    const users = await seedUsers();
    const parcoursList = await seedParcours();
    const pois = await seedPOIs(parcoursList);
    const quizzes = await seedQuizzes();
    await seedQuestions(quizzes);
    const podcasts = await seedPodcasts(parcoursList);
    await updatePOIsWithContent(pois, quizzes, podcasts);
    const challenges = await seedChallenges();
    const badges = await seedBadges();
    const rewards = await seedRewards();
    const treasures = await seedTreasureHunts(parcoursList);
    const treasureItems = await seedTreasureItems(treasures);
    const battalions = await seedBattalions();
    await seedBattalionRoutes(battalions, parcoursList);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - ${users.length} users (password: password123 for all)`);
    console.log(`  - ${parcoursList.length} parcours with GeoJSON paths`);
    console.log(`  - ${pois.length} points of interest with QR codes`);
    console.log(`  - ${quizzes.length} quizzes with questions and answers`);
    console.log(`  - ${podcasts.length} podcasts`);
    console.log(`  - ${challenges.length} challenges`);
    console.log(`  - ${badges.length} badges`);
    console.log(`  - ${rewards.length} rewards`);
    console.log(`  - ${treasures.length} treasure hunts`);
    console.log(
      `  - ${treasureItems.length} treasure items with unique QR codes`,
    );
    console.log(`  - ${battalions.length} battalions`);

    console.log('\n🔐 Admin credentials:');
    console.log('  Email: admin@historando.com');
    console.log('  Password: password123');

    console.log('\n📱 Sample QR Codes Generated:');
    console.log('  - All POIs have unique QR codes for scanning');
    console.log('  - All treasure items have UUID-based QR codes');
    console.log('  - Use the admin dashboard to view/print QR codes');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
