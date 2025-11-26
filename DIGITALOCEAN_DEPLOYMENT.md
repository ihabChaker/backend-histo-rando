# DigitalOcean App Platform Deployment

## Prerequisites

- DigitalOcean account with GitHub Student Pack credits
- GitHub repository connected

## Method 1: UI Deployment (Easiest)

### 1. Create Managed MySQL Database

1. Go to DigitalOcean Console → Databases
2. Click "Create Database"
3. Choose:
   - MySQL 8.0
   - Smallest plan ($15/month, but use student credits)
   - Region closest to your users
4. Note the connection details

### 2. Create App

1. Go to Apps → Create App
2. Connect GitHub repository: `backend-histo-rando`
3. Choose `main` branch
4. Configure:
   - **Type:** Web Service
   - **Build Command:** `npm ci && npm run build`
   - **Run Command:** `node dist/main.js`
   - **HTTP Port:** 3000

### 3. Add Environment Variables

In App Settings → Environment Variables:

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

Generate JWT_SECRET:

```bash
openssl rand -hex 64
```

### 4. Deploy

Click "Create Resources" and DigitalOcean will build and deploy.

Access via: `https://your-app-name.ondigitalocean.app`

---

## Method 2: App Spec (Infrastructure as Code)

Create `app.yaml` in repo root (already created below), then:

```bash
# Install doctl
brew install doctl  # macOS
# or download from https://github.com/digitalocean/doctl/releases

# Authenticate
doctl auth init

# Create app from spec
doctl apps create --spec app.yaml

# Update app
doctl apps update <app-id> --spec app.yaml
```

---

## Method 3: GitHub Actions Deployment

Add to `.github/workflows/deploy-do.yml`:

```yaml
name: Deploy to DigitalOcean

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: [build-check] # Run after CI passes
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Install doctl
        uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DO_API_TOKEN }}

      - name: Deploy to App Platform
        run: |
          doctl apps update ${{ secrets.DO_APP_ID }} --spec app.yaml
```

Required GitHub Secrets:

- `DO_API_TOKEN`: DigitalOcean API token
- `DO_APP_ID`: App ID from DigitalOcean

---

## Database Setup

### Create Database

```sql
CREATE DATABASE histo_rando CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Connection String

DigitalOcean provides:

- Public hostname: `<db-name>.db.ondigitalocean.com`
- Port: 25060
- SSL required: Yes (automatic)

---

## Costs with Student Credits

### Managed MySQL

- Basic: $15/month (512 MB RAM, 10 GB storage)
- Use student credits ($200 for 1 year)

### App Platform

- Basic: $5/month (512 MB RAM)
- Professional: $12/month (1 GB RAM)
- Use student credits

**Total:** ~$20/month covered by $200 credits = 10 months free

---

## Monitoring

- **Logs:** App Platform dashboard → Runtime Logs
- **Metrics:** CPU, Memory, Request rate
- **Alerts:** Configure in Monitoring section
- **Database:** Connection pool, slow queries

---

## CI/CD Integration

DigitalOcean App Platform auto-deploys on push to `main` if connected via UI.

For manual control, use GitHub Actions method above.

---

## Scaling

### Horizontal Scaling

- App Platform → Settings → Resources
- Increase container count
- Load balancer included

### Database Scaling

- Database → Settings
- Upgrade to larger plan
- Add read replicas for reads

---

## Troubleshooting

### Build Fails

- Check build logs in App Platform
- Verify Node.js version (20.x)
- Check `package.json` scripts

### Database Connection

- Verify firewall allows App Platform IPs
- Check SSL/TLS settings (required)
- Use connection pooling (already configured)

### Memory Issues

- Upgrade to larger plan
- Optimize build (reduce dependencies)
- Use Docker multi-stage build

---

## Support Resources

- [DO App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [DO Community Tutorials](https://www.digitalocean.com/community/tags/app-platform)
- [Student Developer Pack](https://www.digitalocean.com/github-students)
