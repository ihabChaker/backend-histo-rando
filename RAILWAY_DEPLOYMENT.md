# Railway Deployment Guide

## Prerequisites

- GitHub Student Pack (includes Railway credits)
- This repository pushed to GitHub

## Quick Deploy Steps

### 1. Sign up for Railway

1. Go to [Railway.app](https://railway.app/)
2. Sign up with your GitHub account
3. Claim GitHub Student Pack benefits if available

### 2. Create New Project

1. Click "New Project" in Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose `backend-histo-rando` repository
4. Select `main` branch

### 3. Add MySQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add MySQL"
3. Railway will create a MySQL instance with credentials

### 4. Configure Environment Variables

Railway auto-generates MySQL variables. Map them to your app's expected names:

Click on your service → Variables → Add these:

```bash
NODE_ENV=production
DB_DIALECT=mysql
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_DATABASE=${{MySQL.MYSQLDATABASE}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
JWT_SECRET=<generate-a-strong-random-secret>
JWT_EXPIRATION=7d
MAX_FILE_SIZE=10485760
UPLOAD_DIRECTORY=./uploads
PORT=${{PORT}}
DB_LOGGING=false
```

**Important:** Generate a strong JWT_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Configure Service Settings

In your service settings:

- **Build Command:** `npm ci && npm run build` (auto-detected)
- **Start Command:** `node dist/main.js` (auto-detected from Procfile)
- **Health Check Path:** `/health` (if you have a health endpoint)

### 6. Deploy

Railway will automatically deploy when you push to `main`. Monitor logs in Railway dashboard.

### 7. Test Your Deployment

Once deployed, Railway gives you a URL like `https://your-app.up.railway.app`

Test endpoints:

```bash
curl https://your-app.up.railway.app/api/v1/health
```

## Automatic Deploys

Railway automatically redeploys when you push to your connected branch. No additional CI/CD configuration needed!

## Database Migrations

If you use Sequelize migrations, you can:

**Option 1:** Let Sequelize auto-sync (not recommended for production)

- Your current config uses `sequelize.sync()` in database module

**Option 2:** Run migrations manually via Railway CLI:

```bash
railway run npx sequelize-cli db:migrate
```

**Option 3:** Add migration step to build (recommended)
Update `package.json`:

```json
{
  "scripts": {
    "build": "nest build",
    "deploy": "npm run build && npx sequelize-cli db:migrate"
  }
}
```

Then set Railway's start command to: `npm run deploy && node dist/main.js`

## Monitoring & Logs

- **Logs:** Real-time in Railway dashboard
- **Metrics:** CPU, Memory, Network usage visible
- **Database:** MySQL metrics and connection info

## Costs

- **Free Tier:** $5/month in credits (limited resources)
- **Student Pack:** Additional credits
- **Hobby Plan:** $5/month for more resources
- **MySQL:** Included in project, usage-based billing

## Troubleshooting

### Build fails

- Check Railway build logs
- Verify all environment variables are set
- Ensure `package.json` scripts are correct

### Database connection fails

- Verify MySQL service is running
- Check DB_HOST and DB_PORT variables
- Ensure variables use Railway's template syntax: `${{MySQL.VARIABLE}}`

### App crashes on start

- Check start command is `node dist/main.js`
- Verify all required env vars are set
- Check logs for missing dependencies

## Alternative: Using Dockerfile

If you prefer Docker deployment, Railway will auto-detect the Dockerfile in this repo.

Railway settings:

- **Build:** Uses Dockerfile automatically
- **Start:** Defined in Dockerfile CMD
- No changes needed!

## Support

- [Railway Docs](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
