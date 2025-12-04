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
import { HistoricalBattalion } from '../modules/historical/entities/historical-battalion.entity';
import { BattalionRoute } from '../modules/historical/entities/battalion-route.entity';
import * as bcrypt from 'bcrypt';

async function clearDatabase() {
  console.log('Clearing existing data...');

  // Clear in correct order (child tables first due to foreign keys)
  await Answer.destroy({ where: {}, force: true });
  await Question.destroy({ where: {}, force: true });
  await Quiz.destroy({ where: {}, force: true });
  await PointOfInterest.destroy({ where: {}, force: true });
  await BattalionRoute.destroy({ where: {}, force: true });
  await HistoricalBattalion.destroy({ where: {}, force: true });
  await TreasureHunt.destroy({ where: {}, force: true });
  await Challenge.destroy({ where: {}, force: true });
  await Badge.destroy({ where: {}, force: true });
  await Reward.destroy({ where: {}, force: true });
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
      difficulty: 'moyen',
      duration: 180,
      distance: 12.5,
      isPmrAccessible: false,
      startLatitude: 49.1594,
      startLongitude: 5.3878,
      endLatitude: 49.1623,
      endLongitude: 5.4012,
      gpxData: null,
      imageUrl: 'https://example.com/verdun.jpg',
      isActive: true,
    },
    {
      name: 'Sentier du Débarquement - Normandie',
      description:
        "Revivez le Débarquement du 6 juin 1944 à travers ce parcours le long des plages d'Omaha Beach. Sites historiques, bunkers et monuments commémoratifs.",
      difficulty: 'facile',
      duration: 120,
      distance: 8.0,
      isPmrAccessible: true,
      startLatitude: 49.3708,
      startLongitude: -0.8649,
      endLatitude: 49.3751,
      endLongitude: -0.8512,
      gpxData: null,
      imageUrl: 'https://example.com/normandie.jpg',
      isActive: true,
    },
    {
      name: 'Route Napoléonienne - Austerlitz',
      description:
        "Explorez les champs de bataille d'Austerlitz où Napoléon remporta sa plus grande victoire en 1805. Monuments, musée et points stratégiques.",
      difficulty: 'difficile',
      duration: 240,
      distance: 18.0,
      isPmrAccessible: false,
      startLatitude: 49.1323,
      startLongitude: 16.7644,
      endLatitude: 49.1456,
      endLongitude: 16.7892,
      gpxData: null,
      imageUrl: 'https://example.com/austerlitz.jpg',
      isActive: true,
    },
    {
      name: 'Voie de la Liberté - Alsace',
      description:
        "Suivez le chemin de la libération de l'Alsace en 1944-1945. Bornes commémoratives, musées et villages historiques jalonnent ce parcours.",
      difficulty: 'facile',
      duration: 150,
      distance: 10.5,
      isPmrAccessible: true,
      startLatitude: 48.5734,
      startLongitude: 7.7521,
      endLatitude: 48.5891,
      endLongitude: 7.7834,
      gpxData: null,
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
      category: 'monument',
      parcoursId: parcoursList[0].id,
      historicalInfo:
        'Construit entre 1885 et 1913, ce fort fut pris par les Allemands le 25 février 1916 et repris par les Français le 24 octobre 1916.',
      imageUrl: 'https://example.com/douaumont.jpg',
      audioGuideUrl: null,
      quizId: null,
    },
    {
      name: 'Ossuaire de Douaumont',
      description:
        'Monument commémoratif abritant les restes de 130 000 soldats inconnus français et allemands.',
      latitude: 49.2012,
      longitude: 5.4389,
      category: 'monument',
      parcoursId: parcoursList[0].id,
      historicalInfo:
        "Inauguré en 1932, l'ossuaire domine le champ de bataille et offre une vue panoramique sur la nécropole nationale.",
      imageUrl: 'https://example.com/ossuaire.jpg',
      audioGuideUrl: null,
      quizId: null,
    },
    {
      name: 'Tranchée des Baïonnettes',
      description:
        "Site emblématique où des soldats furent ensevelis vivants lors d'un bombardement.",
      latitude: 49.1876,
      longitude: 5.4156,
      category: 'site',
      parcoursId: parcoursList[0].id,
      historicalInfo:
        'Le 10 juin 1916, une section du 137e RI fut ensevelie par un obus. Seules les baïonnettes dépassaient du sol.',
      imageUrl: 'https://example.com/baionnettes.jpg',
      audioGuideUrl: null,
      quizId: null,
    },

    // Normandie POIs
    {
      name: 'Omaha Beach',
      description:
        'La plage la plus célèbre du Débarquement, théâtre de combats sanglants le 6 juin 1944.',
      latitude: 49.372,
      longitude: -0.8698,
      category: 'site',
      parcoursId: parcoursList[1].id,
      historicalInfo:
        'Surnommée "Bloody Omaha", cette plage vit le débarquement de la 1re Division d\'infanterie américaine.',
      imageUrl: 'https://example.com/omaha.jpg',
      audioGuideUrl: null,
      quizId: null,
    },
    {
      name: 'Cimetière américain de Colleville',
      description:
        'Le plus grand cimetière militaire américain en Europe avec 9 387 tombes.',
      latitude: 49.3604,
      longitude: -0.8573,
      category: 'monument',
      parcoursId: parcoursList[1].id,
      historicalInfo:
        'Inauguré en 1956, il surplombe Omaha Beach et rend hommage aux soldats tombés lors du Débarquement.',
      imageUrl: 'https://example.com/colleville.jpg',
      audioGuideUrl: null,
      quizId: null,
    },
    {
      name: 'Pointe du Hoc',
      description:
        "Promontoire fortifié pris d'assaut par les Rangers américains le 6 juin 1944.",
      latitude: 49.3969,
      longitude: -0.9889,
      category: 'site',
      parcoursId: parcoursList[1].id,
      historicalInfo:
        "Les Rangers escaladèrent les falaises de 30 mètres sous le feu ennemi pour neutraliser l'artillerie allemande.",
      imageUrl: 'https://example.com/pointe-du-hoc.jpg',
      audioGuideUrl: null,
      quizId: null,
    },

    // Austerlitz POIs
    {
      name: 'Pratzen Heights',
      description:
        "Point culminant du champ de bataille d'Austerlitz, clé de la victoire napoléonienne.",
      latitude: 49.1389,
      longitude: 16.7734,
      category: 'site',
      parcoursId: parcoursList[2].id,
      historicalInfo:
        'Napoléon concentra son attaque sur ce plateau le 2 décembre 1805, brisant le centre de la coalition austro-russe.',
      imageUrl: 'https://example.com/pratzen.jpg',
      audioGuideUrl: null,
      quizId: null,
    },
    {
      name: 'Monument de la Paix',
      description: 'Monument commémorant la bataille des Trois Empereurs.',
      latitude: 49.1412,
      longitude: 16.7823,
      category: 'monument',
      parcoursId: parcoursList[2].id,
      historicalInfo:
        'Érigé en 1912 pour le centenaire de la bataille, ce monument honore tous les soldats tombés.',
      imageUrl: 'https://example.com/monument-paix.jpg',
      audioGuideUrl: null,
      quizId: null,
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
      difficulty: 'moyen',
      points: 50,
      passingScore: 70,
      isActive: true,
    },
    {
      title: 'Le Débarquement de Normandie',
      description: "Que savez-vous du Jour J et de l'opération Overlord ?",
      difficulty: 'facile',
      points: 30,
      passingScore: 60,
      isActive: true,
    },
    {
      title: 'Napoléon Bonaparte',
      description:
        "Quiz sur la vie et les campagnes de l'Empereur des Français.",
      difficulty: 'difficile',
      points: 75,
      passingScore: 80,
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
      questionType: 'multiple_choice',
      points: 10,
      orderIndex: 1,
      answers: [
        {
          answerText: '1914',
          isCorrect: false,
          explanation: "C'était le début de la guerre.",
        },
        {
          answerText: '1916',
          isCorrect: true,
          explanation: "La bataille s'est déroulée de février à décembre 1916.",
        },
        {
          answerText: '1918',
          isCorrect: false,
          explanation: "C'était la fin de la guerre.",
        },
        {
          answerText: '1917',
          isCorrect: false,
          explanation: "Année de l'entrée en guerre des États-Unis.",
        },
      ],
    },
    {
      quizId: quizzes[0].id,
      questionText: "Quel était le mot d'ordre français à Verdun ?",
      questionType: 'multiple_choice',
      points: 10,
      orderIndex: 2,
      answers: [
        {
          answerText: "À l'attaque !",
          isCorrect: false,
          explanation: 'Verdun était une bataille défensive.',
        },
        {
          answerText: 'Ils ne passeront pas',
          isCorrect: true,
          explanation: 'Phrase célèbre du général Nivelle.',
        },
        {
          answerText: 'Pour la patrie',
          isCorrect: false,
          explanation: 'Trop générique.',
        },
        {
          answerText: 'Tenir coûte que coûte',
          isCorrect: false,
          explanation: 'Proche mais pas exact.',
        },
      ],
    },

    // Normandie Quiz
    {
      quizId: quizzes[1].id,
      questionText: 'Quelle était la date du Débarquement de Normandie ?',
      questionType: 'multiple_choice',
      points: 10,
      orderIndex: 1,
      answers: [
        {
          answerText: '5 juin 1944',
          isCorrect: false,
          explanation:
            "C'était le jour prévu initialement mais reporté pour météo.",
        },
        {
          answerText: '6 juin 1944',
          isCorrect: true,
          explanation: 'Le Jour J, opération Overlord.',
        },
        {
          answerText: '7 juin 1944',
          isCorrect: false,
          explanation: "C'était le lendemain du débarquement.",
        },
        {
          answerText: '8 mai 1945',
          isCorrect: false,
          explanation: "C'était le jour de la victoire en Europe.",
        },
      ],
    },
    {
      quizId: quizzes[1].id,
      questionText:
        'Combien de plages principales composaient le secteur de débarquement ?',
      questionType: 'multiple_choice',
      points: 10,
      orderIndex: 2,
      answers: [
        {
          answerText: '3',
          isCorrect: false,
          explanation: 'Il y en avait plus.',
        },
        {
          answerText: '5',
          isCorrect: true,
          explanation: 'Utah, Omaha, Gold, Juno et Sword.',
        },
        {
          answerText: '7',
          isCorrect: false,
          explanation: 'Il y en avait moins.',
        },
        { answerText: '10', isCorrect: false, explanation: 'Beaucoup trop.' },
      ],
    },

    // Napoléon Quiz
    {
      quizId: quizzes[2].id,
      questionText: 'En quelle année Napoléon est-il devenu Empereur ?',
      questionType: 'multiple_choice',
      points: 15,
      orderIndex: 1,
      answers: [
        {
          answerText: '1799',
          isCorrect: false,
          explanation: "Année du coup d'État du 18 Brumaire.",
        },
        {
          answerText: '1804',
          isCorrect: true,
          explanation: 'Sacre de Napoléon Ier à Notre-Dame de Paris.',
        },
        {
          answerText: '1805',
          isCorrect: false,
          explanation: "Année de la bataille d'Austerlitz.",
        },
        {
          answerText: '1800',
          isCorrect: false,
          explanation: 'Année de la bataille de Marengo.',
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
      title: 'Premier Pas',
      description: 'Complétez votre premier parcours historique',
      type: 'parcours_completion',
      targetValue: 1,
      points: 100,
      badgeId: null,
      isActive: true,
      startDate: new Date('2024-01-01'),
      endDate: null,
    },
    {
      title: 'Explorateur Assidu',
      description: "Visitez 10 points d'intérêt",
      type: 'poi_visits',
      targetValue: 10,
      points: 150,
      badgeId: null,
      isActive: true,
      startDate: new Date('2024-01-01'),
      endDate: null,
    },
    {
      title: 'Expert en Histoire',
      description: 'Réussissez 5 quiz avec un score supérieur à 80%',
      type: 'quiz_completion',
      targetValue: 5,
      points: 200,
      badgeId: null,
      isActive: true,
      startDate: new Date('2024-01-01'),
      endDate: null,
    },
    {
      title: 'Marathon Historique',
      description: 'Parcourez 50 km au total',
      type: 'distance_walked',
      targetValue: 50,
      points: 250,
      badgeId: null,
      isActive: true,
      startDate: new Date('2024-01-01'),
      endDate: null,
    },
    {
      title: 'Chasseur de Trésors',
      description: 'Trouvez votre premier trésor caché',
      type: 'treasure_found',
      targetValue: 1,
      points: 100,
      badgeId: null,
      isActive: true,
      startDate: new Date('2024-01-01'),
      endDate: null,
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
      category: 'digital',
      pointsCost: 500,
      stockQuantity: 999,
      imageUrl: 'https://example.com/reward-premium.png',
      isActive: true,
    },
    {
      name: 'T-Shirt HistoRando',
      description: 'T-shirt officiel HistoRando avec logo brodé',
      category: 'merchandise',
      pointsCost: 800,
      stockQuantity: 50,
      imageUrl: 'https://example.com/reward-tshirt.png',
      isActive: true,
    },
    {
      name: 'Livre "Grandes Batailles"',
      description: "Ouvrage illustré sur les grandes batailles de l'histoire",
      category: 'physical',
      pointsCost: 1200,
      stockQuantity: 20,
      imageUrl: 'https://example.com/reward-livre.png',
      isActive: true,
    },
    {
      name: 'Visite Guidée VIP',
      description: "Visite guidée privée d'un site historique au choix",
      category: 'experience',
      pointsCost: 2000,
      stockQuantity: 10,
      imageUrl: 'https://example.com/reward-vip.png',
      isActive: true,
    },
    {
      name: 'Badge Exclusif',
      description: 'Badge numérique ultra-rare',
      category: 'digital',
      pointsCost: 300,
      stockQuantity: 999,
      imageUrl: 'https://example.com/reward-badge.png',
      isActive: true,
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
        'Un authentique casque Adrian de la Première Guerre mondiale (réplique)',
      latitude: 49.1678,
      longitude: 5.3945,
      parcoursId: parcoursList[0].id,
      clue: "Près du monument où reposent les braves, cherchez l'arbre centenaire qui a survécu aux combats.",
      points: 150,
      isActive: true,
    },
    {
      name: 'Médaille du Débarquement',
      description: "Réplique d'une médaille commémorative du Jour J",
      latitude: 49.3689,
      longitude: 5.8621,
      parcoursId: parcoursList[1].id,
      clue: 'Là où les vagues rencontrent le sable, sous la falaise qui a vu tant de courage.',
      points: 150,
      isActive: true,
    },
    {
      name: 'Pièce Napoléonienne',
      description: "Reproduction d'un napoléon d'or frappé en 1805",
      latitude: 49.1401,
      longitude: 16.7756,
      parcoursId: parcoursList[2].id,
      clue: "Au sommet de la colline où l'aigle a triomphé, cherchez près de la pierre gravée.",
      points: 200,
      isActive: true,
    },
  ];

  const createdTreasures = await TreasureHunt.bulkCreate(treasures);
  console.log(`Created ${createdTreasures.length} treasure hunts`);
  return createdTreasures;
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
    const challenges = await seedChallenges();
    const badges = await seedBadges();
    const rewards = await seedRewards();
    const treasures = await seedTreasureHunts(parcoursList);
    const battalions = await seedBattalions();
    await seedBattalionRoutes(battalions, parcoursList);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - ${users.length} users (password: password123 for all)`);
    console.log(`  - ${parcoursList.length} parcours`);
    console.log(`  - ${pois.length} points of interest`);
    console.log(`  - ${quizzes.length} quizzes with questions and answers`);
    console.log(`  - ${challenges.length} challenges`);
    console.log(`  - ${badges.length} badges`);
    console.log(`  - ${rewards.length} rewards`);
    console.log(`  - ${treasures.length} treasure hunts`);
    console.log(`  - ${battalions.length} battalions`);

    console.log('\n🔐 Admin credentials:');
    console.log('  Email: admin@historando.com');
    console.log('  Password: password123');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
