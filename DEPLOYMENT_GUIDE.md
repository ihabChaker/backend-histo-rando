# Complete Deployment Guide - Histo Rando Backend

## Overview

This guide provides step-by-step instructions for deploying the Histo Rando backend to production using your GitHub Student Pack benefits.

**Recommended Platform:** Railway or DigitalOcean

---

## Pre-Deployment Checklist

✅ GitHub repository is public or connected  
✅ CI/CD pipeline passing (all tests green)  
✅ Environment variables documented  
✅ Database schema finalized  
✅ `Dockerfile` present in repo  
✅ `package.json` has correct start command

---

## Option 1: Railway Deployment (Fastest - Recommended for Quick Start)

### Time Required: 5-10 minutes

### Step 1: Sign Up

1. Go to [railway.app](https://railway.app)
2. Click "Login with GitHub"
3. Authorize Railway to access your repositories

### Step 2: Create Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `backend-histo-rando`
4. Railway will start building automatically

### Step 3: Add MySQL Database

1. In your project, click "+ New"
2. Select "Database"
3. Choose "Add MySQL"
4. Railway creates and configures MySQL automatically

### Step 4: Configure Environment Variables

Click on your service → Variables tab → Add these variables:

```bash
NODE_ENV=production
DB_DIALECT=mysql
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_DATABASE=${{MySQL.MYSQLDATABASE}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
JWT_SECRET=<YOUR_GENERATED_SECRET>
JWT_EXPIRATION=7d
MAX_FILE_SIZE=10485760
UPLOAD_DIRECTORY=./uploads
DB_LOGGING=false
```

**Generate JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 5: Verify Deployment

1. Check deployment logs in Railway dashboard
2. Once deployed, click on your service to get the URL
3. Test: `curl https://your-app.up.railway.app/health`

### Step 6: Enable Auto-Deploy

Railway automatically deploys on push to `main`. No configuration needed!

---

## Option 2: DigitalOcean Deployment (Best for Student Credits)

### Time Required: 15-20 minutes

### Prerequisites

- DigitalOcean account
- Claimed GitHub Student Pack ($200 credits)

### Step 1: Create MySQL Database

1. Go to DigitalOcean Console → Databases
2. Click "Create Database Cluster"
3. Select:
   - MySQL 8.0
   - Basic plan ($15/month)
   - Datacenter: Choose closest to your users
   - Name: `histo-rando-db`
4. Click "Create Database Cluster"
5. **Save the connection details** (host, port, username, password)

### Step 2: Create Initial Database

1. Once cluster is ready, go to "Users & Databases" tab
2. Add database: `histo_rando`
3. Note the connection string

### Step 3: Create App Platform App

#### Option A: Using UI (Easier)

1. Go to Apps → "Create App"
2. Choose "GitHub" as source
3. Authorize DigitalOcean to access your repos
4. Select repository: `backend-histo-rando`
5. Select branch: `main`
6. Configure app:
   - **Name:** histo-rando-api
   - **Region:** Same as database
   - **Branch:** main
   - **Auto-deploy:** Yes

7. Edit Plan:
   - **Type:** Web Service
   - **Instance Size:** Basic ($5/month)
   - **Instance Count:** 1

8. Environment:
   - **Build Command:** `npm ci && npm run build`
   - **Run Command:** `node dist/main.js`
   - **HTTP Port:** 3000

9. Add Environment Variables (click "Edit" next to Environment Variables):

```bash
NODE_ENV=production
DB_DIALECT=mysql
DB_HOST=<your-db-host>.db.ondigitalocean.com
DB_PORT=25060
DB_USERNAME=doadmin
DB_PASSWORD=<your-db-password>
DB_DATABASE=histo_rando
DB_NAME=histo_rando
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRATION=7d
MAX_FILE_SIZE=10485760
UPLOAD_DIRECTORY=./uploads
DB_LOGGING=false
```

10. Click "Create Resources"

#### Option B: Using App Spec (Advanced)

1. The repo includes `.do/app.yaml`
2. Update JWT_SECRET in the file
3. Use `doctl` CLI:

```bash
# Install doctl
brew install doctl  # macOS
# or download from https://github.com/digitalocean/doctl

# Authenticate
doctl auth init

# Create app
doctl apps create --spec .do/app.yaml

# Get app ID
doctl apps list

# Update app later
doctl apps update <APP_ID> --spec .do/app.yaml
```

### Step 4: Configure Database Firewall

1. Go to Databases → your cluster → Settings
2. Under "Trusted Sources"
3. Add: Your App Platform app
   - Search for your app name
   - DigitalOcean will auto-configure the connection

### Step 5: Verify Deployment

1. Check build logs in App Platform dashboard
2. Once live, test your endpoints:

```bash
curl https://histo-rando-api-xxxxx.ondigitalocean.app/health
```

### Step 6: Set Up Auto-Deploy

Auto-deploy is enabled by default when connected via GitHub. Every push to `main` triggers a new deployment.

---

## Post-Deployment Steps

### 1. Database Initialization

If using Sequelize auto-sync (current setup):

- Tables are created automatically on first run
- Check app logs to verify

If using migrations:

```bash
# Railway
railway run npx sequelize-cli db:migrate

# DigitalOcean (via console SSH or doctl)
doctl apps logs <APP_ID> --follow
```

### 2. Test API Endpoints

```bash
# Health check
curl https://your-app-url/health

# Register user
curl -X POST https://your-app-url/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","username":"testuser"}'

# Login
curl -X POST https://your-app-url/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### 3. Configure Custom Domain (Optional)

#### Railway

1. Settings → Domains
2. Add custom domain
3. Update DNS records as shown

#### DigitalOcean

1. App Settings → Domains
2. Add domain
3. Configure DNS:
   - CNAME record pointing to `your-app.ondigitalocean.app`

### 4. Set Up Monitoring

#### Railway

- Built-in metrics: CPU, Memory, Network
- Logs: Real-time in dashboard
- Alerts: Configure in settings

#### DigitalOcean

- App Platform → Insights tab
- Set up email alerts
- Configure Uptime checks

### 5. Database Backups

#### Railway

- Automatic daily backups
- No configuration needed

#### DigitalOcean

- Go to Database → Backups
- Daily automated backups included
- Configure retention period
- Enable point-in-time recovery (optional)

---

## Environment Variables Reference

| Variable         | Description               | Example                     |
| ---------------- | ------------------------- | --------------------------- |
| NODE_ENV         | Runtime environment       | `production`                |
| DB_DIALECT       | Database type             | `mysql`                     |
| DB_HOST          | Database hostname         | `xxx.db.ondigitalocean.com` |
| DB_PORT          | Database port             | `3306` or `25060`           |
| DB_USERNAME      | Database user             | `doadmin`                   |
| DB_PASSWORD      | Database password         | `xxxxx`                     |
| DB_DATABASE      | Database name             | `histo_rando`               |
| DB_NAME          | Database name (duplicate) | `histo_rando`               |
| JWT_SECRET       | Secret for JWT tokens     | 64+ char random hex         |
| JWT_EXPIRATION   | Token validity            | `7d`                        |
| MAX_FILE_SIZE    | Upload limit (bytes)      | `10485760`                  |
| UPLOAD_DIRECTORY | Upload path               | `./uploads`                 |
| DB_LOGGING       | Enable SQL logs           | `false`                     |
| PORT             | HTTP port                 | Auto-set by platform        |

---

## Troubleshooting

### Build Fails

**Error:** `nest: command not found`

- ✅ **Fixed:** CI now exports PATH before build
- Verify latest code is pushed

**Error:** `npm ERR! missing script: build`

- Check `package.json` has `"build": "nest build"`

### Database Connection Fails

**Error:** `SequelizeConnectionError: Access denied`

- Verify DB_USERNAME and DB_PASSWORD are correct
- Check database allows connections from app IP
- For DO: Add app to database trusted sources

**Error:** `ETIMEDOUT`

- Database might not be ready yet
- Wait 2-3 minutes after creation
- Check database status in dashboard

### App Crashes on Start

**Error:** `Cannot find module 'dist/main.js'`

- Build command must run: `npm ci && npm run build`
- Verify `dist/` folder is created during build

**Error:** Missing environment variables

- Check all required variables are set
- Use Railway/DO variable templates for database

### High Memory Usage

- Upgrade instance size
- Check for memory leaks in logs
- Consider using Docker build (multi-stage reduces size)

---

## Cost Optimization

### Railway

- Use $5/month plan for development
- Upgrade to $20/month for production
- Monitor usage to avoid overage charges

### DigitalOcean

- Start with smallest tiers:
  - App: Basic ($5/mo)
  - DB: Basic ($15/mo)
- Use student credits: $200 = 10 months free
- Set up billing alerts

### General Tips

- Use Docker multi-stage builds (smaller images)
- Enable compression (gzip)
- Set up CDN for static assets
- Use database connection pooling (already configured)

---

## Security Checklist

✅ Use strong JWT_SECRET (64+ characters)  
✅ Enable HTTPS (automatic on both platforms)  
✅ Set NODE_ENV=production  
✅ Don't commit secrets to Git  
✅ Use environment variables for all config  
✅ Enable database SSL (automatic on both platforms)  
✅ Set up database backups  
✅ Configure rate limiting (add in future)  
✅ Regular security updates: `npm audit`

---

## CI/CD Integration

Your GitHub Actions pipeline runs on every push:

1. Lint & Format check
2. TypeScript compilation
3. Unit tests (93 tests)
4. E2E tests with MySQL
5. Security audit
6. Production build

Platform auto-deploys ONLY if all tests pass!

---

## Scaling Strategy

### Phase 1: Single Instance (Current)

- 1 app instance
- 1 database instance
- Handles ~100-1000 users

### Phase 2: Horizontal Scaling

- Increase app instances (2-3)
- Add database read replicas
- Handles ~1000-10000 users

### Phase 3: Advanced

- Add Redis for caching
- CDN for static assets
- Multiple regions
- Load balancer
- Handles 10000+ users

---

## Support & Resources

### Railway

- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### DigitalOcean

- Docs: https://docs.digitalocean.com
- Community: https://www.digitalocean.com/community
- Support: Ticket system (free)
- Status: https://status.digitalocean.com

---

## Next Steps

1. **Choose your platform** (Railway or DigitalOcean)
2. **Follow the deployment steps** above
3. **Test the API** with provided curl commands
4. **Set up monitoring** and alerts
5. **Configure custom domain** (optional)
6. **Enable backups** and verify they work

---

**Deployment Guides:**

- Railway: `RAILWAY_DEPLOYMENT.md`
- DigitalOcean: `DIGITALOCEAN_DEPLOYMENT.md`
- Comparison: `DEPLOYMENT_COMPARISON.md`

**Support:**
Open an issue in the GitHub repository if you encounter problems.

---

## Deployment Checklist

Before going live:

- [ ] All CI/CD tests passing
- [ ] Environment variables configured
- [ ] Database created and accessible
- [ ] JWT_SECRET generated and set
- [ ] API endpoints tested
- [ ] Database backups enabled
- [ ] Monitoring set up
- [ ] SSL/HTTPS enabled (automatic)
- [ ] Custom domain configured (optional)
- [ ] Error tracking configured (future)

**Ready to deploy!** 🚀
