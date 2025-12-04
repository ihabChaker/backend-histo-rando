# Database Seeder

This seeder populates the HistoRando database with realistic test data for development and testing purposes.

## Quick Start

```bash
cd backend
npm run seed
```

⚠️ **WARNING:** This will DELETE all existing data before seeding!

## What Gets Created

### Users (5 total)
- **1 Admin Account**
  - Email: `admin@historando.com`
  - Password: `password123`
  - Role: admin
  
- **4 Test Users**
  - `jean.dupont@example.com` (350 points)
  - `marie.martin@example.com` (520 points, PMR accessible)
  - `pierre.bernard@example.com` (180 points)
  - `sophie.durand@example.com` (720 points)
  - All passwords: `password123`

### Parcours (4 routes)
1. **Chemin des Poilus - Verdun** (Medium, 12.5km, 180min)
   - Historical WWI route through Verdun battlefields
   
2. **Sentier du Débarquement - Normandie** (Easy, 8km, 120min, PMR accessible)
   - D-Day landing beaches route
   
3. **Route Napoléonienne - Austerlitz** (Hard, 18km, 240min)
   - Napoleon's greatest victory site
   
4. **Voie de la Liberté - Alsace** (Easy, 10.5km, 150min, PMR accessible)
   - Liberation of Alsace route

### Points of Interest (8+ POIs)
- Fort de Douaumont (Verdun)
- Ossuaire de Douaumont (Verdun)
- Tranchée des Baïonnettes (Verdun)
- Omaha Beach (Normandie)
- Cimetière américain de Colleville (Normandie)
- Pointe du Hoc (Normandie)
- Pratzen Heights (Austerlitz)
- Monument de la Paix (Austerlitz)

### Quizzes (3 with questions & answers)
1. **La Bataille de Verdun** (Medium, 50 points, 70% passing)
2. **Le Débarquement de Normandie** (Easy, 30 points, 60% passing)
3. **Napoléon Bonaparte** (Hard, 75 points, 80% passing)

Each quiz includes multiple questions with 4 answer choices and explanations.

### Challenges (5 active)
1. **Premier Pas** - Complete first parcours (100 points)
2. **Explorateur Assidu** - Visit 10 POIs (150 points)
3. **Expert en Histoire** - Pass 5 quizzes with 80%+ (200 points)
4. **Marathon Historique** - Walk 50km total (250 points)
5. **Chasseur de Trésors** - Find first treasure (100 points)

### Badges (5 rarities)
1. **Débutant** (Common) - Complete 1 parcours (50 points)
2. **Explorateur** (Rare) - Visit 20 POIs (100 points)
3. **Historien** (Epic) - Pass all quizzes (150 points)
4. **Légende** (Legendary) - Complete all challenges (300 points)
5. **Marathon** (Epic) - Walk 100km (200 points)

### Rewards (5 items)
1. **Guide Historique Premium** (Digital, 500 points)
2. **T-Shirt HistoRando** (Merchandise, 800 points, 50 in stock)
3. **Livre "Grandes Batailles"** (Physical, 1200 points, 20 in stock)
4. **Visite Guidée VIP** (Experience, 2000 points, 10 in stock)
5. **Badge Exclusif** (Digital, 300 points)

### Treasure Hunts (3 hidden treasures)
1. **Casque de Poilu** - Verdun route (150 points)
2. **Médaille du Débarquement** - Normandie route (150 points)
3. **Pièce Napoléonienne** - Austerlitz route (200 points)

Each includes GPS coordinates and clues.

### Historical Battalions (3 units)
1. **2e Division Blindée** (France, Leclerc's division)
2. **101st Airborne Division** (USA, Screaming Eagles)
3. **Régiment de Tirailleurs Sénégalais** (France, Colonial troops)

With associated historical routes and dates.

## How It Works

The seeder:
1. Waits 5 seconds for you to cancel (Ctrl+C)
2. Deletes all existing data (CASCADE deletes)
3. Creates data in dependency order:
   - Users first
   - Parcours
   - POIs (linked to parcours)
   - Quizzes with questions and answers
   - Challenges
   - Badges
   - Rewards
   - Treasure hunts
   - Battalions and routes
4. Shows a summary of created data

## Safety Features

- **5-second warning** before deletion
- **Consistent test data** - same data every time
- **Foreign key respect** - creates in correct order
- **Realistic data** - based on real historical sites

## Development Tips

### Testing Authentication
Use these credentials in Postman/Swagger:
```json
{
  "email": "admin@historando.com",
  "password": "password123"
}
```

### Testing User Features
Login as regular users:
```json
{
  "email": "jean.dupont@example.com",
  "password": "password123"
}
```

### Testing Pagination
With 5 users, 4 parcours, 8+ POIs, you can test:
- Page 1 vs Page 2
- Different page sizes (5, 10, 20)
- Empty pages

### Testing Permissions
- Admin user can access all admin endpoints
- Regular users should get 403 on admin operations

### Testing Relationships
All data is properly linked:
- POIs belong to specific parcours
- Quizzes have questions and answers
- Treasures are hidden on parcours routes
- Battalions have historical routes

## Customizing Seed Data

Edit `backend/src/scripts/seed-database.ts` to:
- Add more users
- Create additional parcours
- Add custom POIs
- Create your own quizzes
- Define new challenges

Then run `npm run seed` again.

## Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### "Connection refused" error
Check that PostgreSQL is running and `.env` is configured correctly.

### Foreign key constraint errors
The seeder deletes in the correct order. If you see FK errors, check:
- Database schema is up to date (`npm run db:sync`)
- No manual data was added that breaks relationships

### Seeder hangs at "Clearing existing data"
Large datasets take time to delete. Be patient or:
```bash
# Manually truncate all tables
npm run db:sync
```

## Related Commands

```bash
# Sync database schema without seeding
npm run db:sync

# Create only an admin user (no seed data)
npm run admin:create

# Start backend with seeded data
npm run seed && npm run start:dev
```

## For Production

**DO NOT** run this seeder in production! It will delete all real user data.

For production data:
- Use proper database migrations
- Import real historical content
- Let users create organic data

---

Happy Testing! 🌱
