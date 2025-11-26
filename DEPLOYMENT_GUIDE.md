# DigitalOcean Deployment Guide - Histo Rando Backend

## Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Initial Setup](#initial-setup)
4. [CI/CD Automated Deployment](#cicd-automated-deployment)
5. [Post-Deployment Steps](#post-deployment-steps)
6. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers deploying the Histo Rando backend to DigitalOcean App Platform with automated CI/CD.

### What You'll Get

- ✅ **Managed MySQL Database** - Automatic backups, scaling, monitoring
- ✅ **Auto-deploy on CI success** - Deploy only when all tests pass
- ✅ **$200 Student Credits** - 10 months of free hosting
- ✅ **Production-ready setup** - SSL, monitoring, logs included

### How It Works

```
Developer pushes to main
         ↓
GitHub Actions runs CI Pipeline
         ↓
    All tests pass?
         ↓ YES
Auto-merge main → deploy branch
         ↓
DigitalOcean detects deploy branch update
         ↓
Automatic deployment to production
```

### Cost Breakdown

- **App Platform (Basic):** $5/month
- **Managed MySQL (Basic):** $15/month
- **Total:** $20/month
- **With $200 Student Credits:** **FREE for 10 months**

---

## Pre-Deployment Checklist

Before deploying, ensure:

✅ GitHub repository is public or accessible  
✅ GitHub Student Pack claimed ($200 DigitalOcean credits)  
✅ CI/CD pipeline passing (all tests green)  
✅ DigitalOcean account created

---

## Initial Setup

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

### Step 3: Create Deploy Branch

Create a `deploy` branch that DigitalOcean will monitor for auto-deployment:

```bash
# In your local repository
git checkout main
git pull origin main
git checkout -b deploy
git push origin deploy
```

**Important:** This branch will be auto-updated by GitHub Actions when CI passes.

### Step 4: Create App Platform App

1. Go to Apps → "Create App"
2. Choose "GitHub" as source
3. Authorize DigitalOcean to access your repos
4. Select repository: `backend-histo-rando`
5. **Select branch: `deploy`** (not main!)
6. Configure app:
   - **Name:** histo-rando-api
   - **Region:** Same as database
   - **Branch:** deploy
   - **Auto-deploy:** ✅ **YES** (enable this!)

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

### Step 5: Configure Database Firewall

1. Go to Databases → your cluster → Settings
2. Under "Trusted Sources"
3. Add: Your App Platform app
   - Search for your app name
   - DigitalOcean will auto-configure the connection

### Step 6: Verify Initial Deployment

1. Check build logs in App Platform dashboard
2. Once live, test your endpoints:

```bash
curl https://histo-rando-api-xxxxx.ondigitalocean.app/health
```

---

## CI/CD Automated Deployment

The repository is already configured for automated, gated deployments. Here's how it works:

### How It Works

1. **You push code to `main` branch**
2. **GitHub Actions runs CI Pipeline:**
   - Lint & Format ✓
   - Type Check ✓
   - Unit Tests (93 tests) ✓
   - E2E Tests (14 tests) ✓
   - Build Check ✓
   - Security Audit ✓

3. **If ALL tests pass:**
   - GitHub Actions automatically merges `main` → `deploy` branch
   - DigitalOcean detects the update to `deploy` branch
   - **Automatic deployment starts** 🚀

4. **If ANY test fails:**
   - No merge happens
   - No deployment occurs
   - **Broken code never reaches production** ✅

### Workflow Configuration

The workflow is already set up in `.github/workflows/deploy-digitalocean.yml`:

```yaml
name: Auto-Merge to Deploy Branch

on:
  workflow_run:
    workflows: ['CI Pipeline']
    types: [completed]
    branches: [main]

jobs:
  merge-to-deploy:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - Checkout code
      - Merge main into deploy branch
      - Push to deploy branch
      - DigitalOcean auto-deploys
```

### What This Means for You

**Normal Development Workflow:**

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main

# GitHub Actions automatically:
# 1. Runs all tests
# 2. If pass: merges to deploy branch
# 3. DigitalOcean deploys automatically
```

**You never touch the `deploy` branch manually!**

### Monitoring Deployments

**GitHub Actions:**

1. Go to your repository → Actions tab
2. You'll see two workflows:
   - **CI Pipeline** - Runs on every push to main
   - **Auto-Merge to Deploy Branch** - Runs after CI succeeds

**DigitalOcean:**

1. Go to Apps → Your app → Activity
2. See automated deployments with timestamps
3. View build logs and deployment status

### Benefits

✅ **Safety:** Broken code never reaches production  
✅ **Simplicity:** No complex deployment configurations  
✅ **Automation:** Push to main and forget  
✅ **Visibility:** Clear status in both GitHub and DigitalOcean  
✅ **Rollback:** Easy to revert via GitHub

---

## Post-Deployment Steps

### 1. Database Initialization

Tables are created automatically on first deployment via Sequelize auto-sync. Check app logs to verify:

```bash
# In DigitalOcean App Platform dashboard
Apps → Your app → Runtime Logs
```

Look for: `Database synchronized successfully`

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

1. App Settings → Domains
2. Add your domain
3. Configure DNS:
   - Add CNAME record pointing to `your-app.ondigitalocean.app`
4. SSL certificate is auto-generated

### 4. Set Up Monitoring

- Go to App Platform → Insights tab
- View real-time metrics: CPU, Memory, Request rate
- Set up email alerts for downtime
- Configure Uptime checks

### 5. Database Backups

- Go to Database → Backups tab
- Daily automated backups are enabled by default
- Configure retention period (7-30 days)
- Enable point-in-time recovery for production (optional, extra cost)

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

### Deployment Issues

**Issue: Auto-merge to deploy branch fails**

```bash
# Check GitHub Actions logs
# Common fix: Ensure deploy branch exists
git checkout -b deploy
git push origin deploy
```

**Issue: DigitalOcean not detecting deploy branch updates**

- Go to App Settings → check branch is set to `deploy`
- Verify "Auto-deploy" is enabled
- Check GitHub integration is still authorized

### Build Issues

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

## Manual Deployment (Emergency)

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

## CI/CD Pipeline Details

Your GitHub Actions pipeline runs on every push to `main`:

**CI Pipeline Jobs:**

1. Lint & Format check
2. TypeScript compilation
3. Unit tests (93 tests)
4. E2E tests with MySQL
5. Security audit
6. Production build check

**If all pass:**

- Auto-merge workflow triggers
- Merges `main` → `deploy` branch
- DigitalOcean auto-deploys from `deploy` branch

**If any fail:**

- No merge occurs
- No deployment happens
- Broken code stays in development

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

## Quick Reference

### Important URLs

- **App Dashboard:** https://cloud.digitalocean.com/apps
- **Database:** https://cloud.digitalocean.com/databases
- **API Docs:** https://docs.digitalocean.com/products/app-platform/

### Environment Variables

Generate JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Common Commands

```bash
# View logs
doctl apps logs <APP_ID> --follow

# List apps
doctl apps list

# Get app info
doctl apps get <APP_ID>
```

---

## Support & Resources

- Docs: https://docs.digitalocean.com/products/app-platform/
- Community: https://www.digitalocean.com/community
- Support: Ticket system (available with paid plans)
- Status: https://status.digitalocean.com
- Student Pack: https://www.digitalocean.com/github-students

---

## Next Steps

1. ✅ Create DigitalOcean account and claim student credits
2. ✅ Create MySQL database ($15/month)
3. ✅ Create deploy branch
4. ✅ Create App Platform app (watch `deploy` branch)
5. ✅ Configure environment variables
6. ✅ Test deployment by pushing to main
7. ✅ Monitor in GitHub Actions and DigitalOcean
8. ✅ Set up custom domain (optional)
9. ✅ Configure monitoring and alerts

**Ready to deploy!** 🚀

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
