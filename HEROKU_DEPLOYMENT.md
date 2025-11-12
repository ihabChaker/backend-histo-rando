# Heroku Deployment Guide

## 🎯 Overview

This guide will help you deploy the HistoRando Backend API to Heroku with PostgreSQL database.

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ Heroku account (free tier works)
2. ✅ Heroku CLI installed
3. ✅ Git repository on GitHub
4. ✅ All tests passing locally
5. ✅ Environment variables documented

---

## 🚀 Quick Start (Manual Deployment)

### **Step 1: Install Heroku CLI**

**macOS**:

```bash
brew tap heroku/brew && brew install heroku
```

**Linux**:

```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

**Windows**:
Download from: https://devcenter.heroku.com/articles/heroku-cli

**Verify Installation**:

```bash
heroku --version
# Expected: heroku/8.x.x
```

---

### **Step 2: Login to Heroku**

```bash
heroku login
# Opens browser for authentication
```

---

### **Step 3: Create Heroku App**

```bash
# Navigate to project directory
cd /home/iheb/Desktop/projets/histo_rando/backend

# Create Heroku app (choose unique name)
heroku create histo-rando-api

# Or specify region
heroku create histo-rando-api --region eu
```

**Output**:

```
Creating ⬢ histo-rando-api... done
https://histo-rando-api.herokuapp.com/ | https://git.heroku.com/histo-rando-api.git
```

---

### **Step 4: Add PostgreSQL Database**

```bash
# Add Heroku PostgreSQL (free hobby-dev tier)
heroku addons:create heroku-postgresql:mini

# Check database info
heroku pg:info

# Get database connection string
heroku config:get DATABASE_URL
```

**Expected Output**:

```
postgres://username:password@host:5432/database_name
```

---

### **Step 5: Configure Environment Variables**

```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
heroku config:set JWT_EXPIRES_IN="7d"

# Database is auto-configured by DATABASE_URL
# No need to set DB_HOST, DB_PORT, etc. separately

# Optional: Set CORS origins
heroku config:set CORS_ORIGIN="https://yourdomain.com,https://app.yourdomain.com"

# View all config variables
heroku config
```

---

### **Step 6: Update Database Configuration**

You need to modify your database config to support Heroku's `DATABASE_URL` format.

**Edit `src/config/database.config.js`**:

```javascript
module.exports = {
  development: {
    // ... existing config
  },
  test: {
    // ... existing config
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  },
};
```

**Or update your NestJS database module** (if using direct connection):

```typescript
// src/database/database.module.ts
import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get("DATABASE_URL");

        if (databaseUrl) {
          // Heroku provides DATABASE_URL
          return {
            dialect: "postgres",
            url: databaseUrl,
            dialectOptions: {
              ssl: {
                require: true,
                rejectUnauthorized: false,
              },
            },
            autoLoadModels: true,
            synchronize: false,
            logging: false,
          };
        }

        // Local development config
        return {
          dialect: "postgres",
          host: configService.get("DB_HOST"),
          port: configService.get("DB_PORT"),
          username: configService.get("DB_USERNAME"),
          password: configService.get("DB_PASSWORD"),
          database: configService.get("DB_NAME"),
          autoLoadModels: true,
          synchronize: false,
          logging: console.log,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
```

---

### **Step 7: Deploy to Heroku**

```bash
# Add Heroku remote (if not already added)
heroku git:remote -a histo-rando-api

# Deploy to Heroku
git push heroku main

# Or deploy from a different branch
git push heroku develop:main
```

**Expected Output**:

```
Enumerating objects: 1234, done.
Counting objects: 100% (1234/1234), done.
Delta compression using up to 8 threads
Compressing objects: 100% (567/567), done.
Writing objects: 100% (1234/1234), 1.23 MiB | 1.50 MiB/s, done.
Total 1234 (delta 890), reused 1100 (delta 800)
remote: Compressing source files... done.
remote: Building source:
remote: -----> Building on the Heroku-20 stack
remote: -----> Using buildpack: heroku/nodejs
remote: -----> Node.js app detected
remote: -----> Installing Node.js 20.x
remote: -----> Installing dependencies
remote:        Installing node modules
remote:        added 1234 packages
remote: -----> Build
remote:        Running build
remote:        > histo-rando-backend@1.0.0 heroku-postbuild
remote:        > npm run build
remote: -----> Launching...
remote:        Released v1
remote:        https://histo-rando-api.herokuapp.com/ deployed to Heroku
```

---

### **Step 8: Run Database Migrations (if needed)**

```bash
# Connect to Heroku bash
heroku run bash

# Inside Heroku environment
npm run migration:run

# Exit
exit
```

---

### **Step 9: Verify Deployment**

```bash
# Check app status
heroku ps

# View logs
heroku logs --tail

# Open app in browser
heroku open

# Test API endpoint
curl https://histo-rando-api.herokuapp.com/health

# Test Swagger docs
curl https://histo-rando-api.herokuapp.com/api/docs
```

---

## 🔄 Automated Deployment (GitHub Actions)

### **Step 1: Get Heroku API Key**

```bash
heroku auth:token
```

Copy the token (looks like: `12345678-abcd-1234-abcd-1234567890ab`)

---

### **Step 2: Add GitHub Secrets**

Go to GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

Add these secrets:

| Name              | Value                | Example                  |
| ----------------- | -------------------- | ------------------------ |
| `HEROKU_API_KEY`  | Your Heroku API key  | `12345678-abcd-1234...`  |
| `HEROKU_APP_NAME` | Your Heroku app name | `histo-rando-api`        |
| `HEROKU_EMAIL`    | Your Heroku email    | `your-email@example.com` |

---

### **Step 3: Enable Deployment Workflow**

Edit `.github/workflows/deploy.yml`:

**Change FROM**:

```yaml
# on:
#   workflow_run:
#     workflows: ["CI Pipeline"]
```

**Change TO**:

```yaml
on:
  workflow_run:
    workflows: ["CI Pipeline"]
    types:
      - completed
    branches:
      - main
  workflow_dispatch: # Allows manual trigger
```

---

### **Step 4: Commit and Push**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: enable automated deployment to Heroku"
git push origin main
```

---

### **Step 5: Monitor Deployment**

1. Go to GitHub → Actions tab
2. Watch "CI Pipeline" workflow complete (5-7 minutes)
3. If CI passes, "Deploy to Heroku" workflow triggers automatically
4. Monitor deployment logs in GitHub Actions

---

## 🗄️ Database Management

### **Access Heroku PostgreSQL**

```bash
# Connect to PostgreSQL
heroku pg:psql

# Inside PostgreSQL prompt
\dt          # List tables
\d users     # Describe users table
SELECT * FROM users LIMIT 5;
\q           # Quit
```

---

### **Database Backups**

```bash
# Create manual backup
heroku pg:backups:capture

# List backups
heroku pg:backups

# Download latest backup
heroku pg:backups:download

# Restore from backup
heroku pg:backups:restore b001
```

---

### **Reset Database** ⚠️ **DANGER**

```bash
# This will DELETE ALL DATA
heroku pg:reset DATABASE_URL --confirm histo-rando-api

# Then run migrations
heroku run npm run migration:run
```

---

## 🔍 Monitoring & Debugging

### **View Logs**

```bash
# Real-time logs (Ctrl+C to exit)
heroku logs --tail

# Last 100 lines
heroku logs -n 100

# Filter by source
heroku logs --source app --tail

# Filter by level
heroku logs --level error
```

---

### **Check Application Status**

```bash
# Dyno status
heroku ps

# Restart all dynos
heroku restart

# Scale dynos
heroku ps:scale web=1
```

---

### **Performance Metrics**

```bash
# View metrics (requires dashboard or metrics add-on)
heroku metrics

# Check response times
heroku logs --tail | grep "GET"
```

---

## 🚨 Troubleshooting

### **Issue 1: Application Crashed (H10)**

```bash
heroku logs --tail
```

**Common causes**:

- Port binding issue (use `process.env.PORT`)
- Missing environment variables
- Database connection failure

**Fix**:

```typescript
// main.ts
const port = process.env.PORT || 3000;
await app.listen(port, "0.0.0.0");
```

---

### **Issue 2: Database Connection Refused**

**Error**:

```
Error: connect ECONNREFUSED
```

**Fix**:

```bash
# Check DATABASE_URL is set
heroku config:get DATABASE_URL

# Ensure SSL is enabled in database config
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}
```

---

### **Issue 3: Build Failures**

**Error**:

```
npm ERR! missing script: heroku-postbuild
```

**Fix**: Ensure `package.json` has:

```json
{
  "scripts": {
    "heroku-postbuild": "npm run build"
  }
}
```

---

### **Issue 4: Environment Variables Not Loaded**

**Fix**:

```bash
# Check all variables
heroku config

# Set missing variables
heroku config:set VARIABLE_NAME="value"

# Restart app after changes
heroku restart
```

---

### **Issue 5: Dyno Sleeping (Free Tier)**

Free dynos sleep after 30 minutes of inactivity.

**Solutions**:

1. Upgrade to Hobby tier ($7/month)
2. Use uptime monitoring service (e.g., UptimeRobot)
3. Accept cold starts (5-10 seconds on first request)

---

## 💰 Pricing

### **Heroku Plans**:

| Tier     | Price  | Dynos    | Database  | Sleep?       |
| -------- | ------ | -------- | --------- | ------------ |
| Free     | $0     | 1        | 10k rows  | Yes (30 min) |
| Hobby    | $7/mo  | 1        | 10M rows  | No           |
| Standard | $25/mo | Multiple | Unlimited | No           |

### **Add-ons**:

| Add-on            | Free Tier       | Paid    |
| ----------------- | --------------- | ------- |
| PostgreSQL        | Mini (10k rows) | $9+/mo  |
| Redis             | 25MB            | $15+/mo |
| Papertrail (Logs) | 7 days          | $7+/mo  |

---

## 🔒 Security Best Practices

### **1. Use Strong JWT Secret**

```bash
# Generate strong secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Set on Heroku
heroku config:set JWT_SECRET="generated-secret-here"
```

---

### **2. Enable CORS Properly**

```typescript
// main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(",") || "*",
  credentials: true,
});
```

```bash
heroku config:set CORS_ORIGIN="https://yourdomain.com"
```

---

### **3. Use SSL/TLS**

Heroku provides free SSL certificates. Ensure all traffic uses HTTPS:

```typescript
// Redirect HTTP to HTTPS (if needed)
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

### **4. Rate Limiting**

Install rate limiter:

```bash
npm install @nestjs/throttler
```

Configure:

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 1 minute
      limit: 100,  // 100 requests per minute
    }]),
  ],
})
```

---

## 📊 Custom Domain (Optional)

### **Add Custom Domain**

```bash
# Add domain
heroku domains:add api.yourdomain.com

# Get DNS target
heroku domains

# Add CNAME record in your DNS provider:
# CNAME api.yourdomain.com → your-app-name.herokuapp.com
```

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`npm run test:e2e`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Swagger documentation complete
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Security audit passed (`npm audit`)
- [ ] `.env` files in `.gitignore`
- [ ] Heroku app created
- [ ] PostgreSQL add-on added
- [ ] Config variables set on Heroku
- [ ] CI/CD pipeline tested
- [ ] Rollback plan documented

---

## 🆘 Support Resources

**Heroku Documentation**:

- Platform: https://devcenter.heroku.com/
- Node.js: https://devcenter.heroku.com/articles/deploying-nodejs
- PostgreSQL: https://devcenter.heroku.com/articles/heroku-postgresql

**NestJS Documentation**:

- Deployment: https://docs.nestjs.com/deployment

**Community**:

- Heroku Status: https://status.heroku.com/
- Heroku Support: https://help.heroku.com/

---

## 🎯 Next Steps After Deployment

1. **Test all endpoints** via Swagger UI
2. **Monitor logs** for errors (`heroku logs --tail`)
3. **Set up monitoring** (e.g., Sentry, LogRocket)
4. **Configure backups** (automated daily backups)
5. **Add custom domain** (if applicable)
6. **Enable metrics** (Heroku metrics add-on)
7. **Document API** for frontend team
8. **Load testing** (ensure scalability)

---

## 🚀 You're Ready to Deploy!

When you're ready to deploy:

```bash
# Manual deployment
git push heroku main

# Or wait for automated deployment after CI passes
git push origin main
```

Good luck! 🎉
