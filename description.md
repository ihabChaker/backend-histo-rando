# HistoRando — Architecture

Ce document présente la liste et la description des proposés pour l'application mobile HistoRando (découverte historique et randonnées). L'objectif est de séparer les responsabilités pour obtenir une architecture modulaire, évolutive et testable.

## Principes généraux

- Services petits et à responsabilité unique.
- Stockage persistant par service (base de données par service) + stockage d'objets centralisé pour médias.
- Authentification centralisée (Auth Service) délivrant des JWT.

## Liste des services

1. GateWay API (API Gateway)
2. Auth Service +
3. User Profile Service +
4. Parcours Service +
5. POI (Point of Interest) Service
6. Media/Content Service (podcasts, images, audio) +
7. Activity Service +
8. Quiz Service +
9. Challenge Service +
10. Treasure Hunt Service
11. Reward Service
12. Battalion/Historical Service
13. Notification Service
14. Analytics Service
15. Mobile Client / Frontend (app)

---

api/auth/login
api/auth/logout

## Description des services

### 1) API Gateway

- Point d'entrée unique pour les clients mobiles.
- Routage vers les internes, authentification (vérification du JWT), throttling, TLS termination.
- Expose endpoints REST publique (ou GraphQL si souhaité).

Responsabilités : routage, auth check, agrégation simple de données.

### 2) Auth Service

- Gestion de l'inscription, connexion, mot de passe, réinitialisation, validation d'email.
- Émission et révocation des tokens JWT.
- Gestion des rôles (utilisateur, admin) et du consentement.

Stockage : base relationnelle (Postgres) + cache (Redis) pour sessions/rate-limit.

### 3) User Profile Service

- Profil utilisateur (nom, avatar, PMR flag, contact), statistiques cumulées (km totaux, points totaux), paramètres.
- Historique des récompenses et préférences.

Responsabilité claire séparée de l'authentification pour faciliter évolutions du profil.

### 4) Parcours Service

- CRUD des parcours (trails) : nom, description, distance, difficulté, GPX, points de départ, accessibilité PMR, images.
- Publication / mise à jour des parcours.

Stockage : Postgres + fichiers GPX stockés dans un object store (MinIO/S3).

### 5) POI (Point of Interest) Service

- Gestion des points d'intérêt : localisations, type (bunker, mémorial...), description, médias associés, QR codes.
- Ordre des POI dans un parcours.

Exposition : endpoints pour récupérer POI autour d'une position et pour lien avec QR scanning.

### 6) Media / Content Service

- Stockage et distribution des médias : podcasts, images, miniatures, fichiers audio.
- Transcodage (si nécessaire), CDN ou pré-signed URLs pour téléchargement.

Stockage : MinIO / S3. Indexation minimale dans DB pour métadonnées.

### 7) Activity Service

- Suivi des sessions utilisateur (start/end datetime, distance, trace GPX, vitesse, activité : marche/course/vélo).
- Calcul et attribution des points liés à une activité (pellets d'événements ou via règles business).
- Liaison avec POI visits, challenges et trésors trouvés.

Événements produits : ActivityCompleted (points gagnés, km parcourus).

### 8) Quiz Service

- Gestion des quizzes : quiz, questions, réponses, barèmes de points.
- Endpoints pour récupérer questions, soumettre réponses et calculer score.
- Enregistrement des tentatives utilisateurs.

### 9) Challenge Service

- Définition des challenges physiques (ex: sac lesté, tenue period), suivi de la progression, règles et récompenses.
- Liaison avec Activity Service pour détecter complétions.

### 10) Treasure Hunt Service

- Gestion des objets à trouver (coordonnées, QR code, rayon de scan, points attribués).
- Endpoints pour valider un scan depuis l'app (vérifier position, rayon, unique par utilisateur, attribution de points).

### 11) Reward Service

- Catalogue des récompenses échangeables contre des points (badges, réductions, cadeaux).
- Gestion des stocks, codes de rédemption, historique des rédemptions.
- Opérations transactionnelles : débiter les points et créer la demande de rédemption.

### 12) Battalion / Historical Service

- Stockage des entités historiques (bataillons, routes historiques) et des liaisons avec les parcours modernes.
- Contenu contextuel (texte, dates, cartes historiques).

### 13) Notification Service

- Envoi de notifications push, emails et in-app (ex: récompense disponible, rappel d'un parcours).
- Template et queueing des messages.

### 14) Analytics Service

- Collecte et agrégation d'événements pour analyses : fréquentation des parcours, POI populaires, performance des podcasts/quizzes.
- Génération de rapports et export pour dashboards.

### 15) Mobile Client / Frontend

- Application mobile (iOS / Android) consommant l'API Gateway.
- Gestion offline minimal (caching des parcours/podcasts), géolocalisation, scan QR, playback audio.

---

## Communication entre services

- Requêtes synchrones : REST/JSON (ou gRPC si besoin de performances).
- Évènements asynchrones : message broker (RabbitMQ / Kafka) pour événements importants :
  - ActivityCompleted
  - PointsAwarded
  - TreasureFound
  - RewardRedeemed
  - UserProfileUpdated

Pattern recommandé : chaque service publie des événements domain-specific et consomme ceux qui l'intéressent.

## Stockage et médias

- Bases relationnelles : PostgreSQL pour la plupart des services (profil, parcours, quiz, reward).
- Cache : Redis pour sessions, counters, leaderboard partiel.
- Stockage médias : MinIO / AWS S3 pour podcasts, images, GPX.
- Indexation géospatiale : PostGIS pour requêtes géographiques (POI/proximité).

## Sécurité

- Auth centralisée (JWT) émise par Auth Service ; Gateway valide les tokens.
- RBAC minimal (user / admin).
- HTTPS obligatoire, protection contre brute-force et rate limiting.
- Validation côté serveur pour toutes les entrées (notamment coordonnées et uploads).

## Déploiement et opérabilité

- Conteneurisation (Docker) pour chaque service.
- Orchestration : Kubernetes ou Docker Compose pour dev.
- Observabilité : logs centralisés (ELK / Loki), traces (OpenTelemetry), métriques (Prometheus + Grafana).

---

## Prochaines étapes suggérées

1. Rédiger un `docker-compose` de développement pour lancer les services essentiels (auth, gateway, user, parcours, postegres, redis, minio).
2. Définir les contrats d'API (OpenAPI) pour chaque service.
3. Mettre en place le broker d'événements et définir les schémas d'événements.
4. Implémenter un prototype minimal (auth + parcours + activity) et vérifier le flux points -> récompenses.

---

Fichier généré automatiquement pour servir de base à l'architecture du projet HistoRando.

Rapprocher le patrimoine plus attractif a qlq1 qui consomme plus la technologie,
on fait un prototype pour montrer que le projet rend le patrimoine plus attractif
Une problematique => solution

savoir vendre son idée/projet
Le jeux aider les gens a s'apprendre plus, aider les gens a s'amuser plus de le patrimoine
