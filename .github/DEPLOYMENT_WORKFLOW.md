# Deployment Workflow - How It Works

## Overview

This project uses a **branch-based CI/CD gating** strategy for safe, automated deployments to DigitalOcean.

## The Simple Concept

```
main branch = Development & CI testing
deploy branch = Production (auto-deploys to DigitalOcean)
```

**Only code that passes ALL tests gets merged to `deploy` → Only tested code reaches production**

---

## How It Works

### Step-by-Step Flow

1. **Developer pushes to `main`**

   ```bash
   git push origin main
   ```

2. **GitHub Actions runs CI Pipeline** (`.github/workflows/ci.yml`)
   - ✓ Lint & Format
   - ✓ Type Check
   - ✓ Unit Tests (93 tests)
   - ✓ E2E Tests (14 tests)
   - ✓ Build Check
   - ✓ Security Audit

3. **IF all tests pass:**
   - Auto-merge workflow triggers (`.github/workflows/deploy-digitalocean.yml`)
   - GitHub Actions merges `main` → `deploy` branch
   - Push to `deploy` branch

4. **DigitalOcean detects update to `deploy` branch**
   - Auto-deploy is enabled for `deploy` branch only
   - Builds and deploys new version
   - Updates production

5. **IF any test fails:**
   - No merge happens
   - `deploy` branch unchanged
   - Production stays safe ✅

---

## Why This Approach?

### ✅ Advantages

1. **Simplicity:** No complex deployment APIs or secrets needed
2. **Git-native:** Uses standard Git branching workflow
3. **Safe:** Broken code never reaches production
4. **Transparent:** Clear separation between dev and production
5. **Standard:** Works with any platform that supports branch-based deployments

### 🎯 Compared to Alternatives

| Approach                      | Complexity | Safety | Maintenance    |
| ----------------------------- | ---------- | ------ | -------------- |
| **Branch-based (our choice)** | Low        | High   | Easy           |
| workflow_run with doctl API   | High       | High   | Complex        |
| Direct main deployment        | Very Low   | Low    | Easy           |
| Manual deployments            | Low        | Medium | Time-consuming |

---

## Branch Strategy

### `main` Branch

- **Purpose:** Active development
- **Protection:** Optional (recommended: require PR reviews)
- **CI:** Runs on every push
- **Deployment:** Never deploys directly

### `deploy` Branch

- **Purpose:** Production releases
- **Protection:** ⚠️ **IMPORTANT:** Never push directly!
- **Updates:** Only via GitHub Actions auto-merge
- **Deployment:** DigitalOcean auto-deploys on every push

---

## Configuration Files

### `.github/workflows/ci.yml`

**Purpose:** Run tests on every push to `main`

**Key jobs:**

- lint-and-format
- type-check
- unit-tests
- e2e-tests
- security-audit
- build-check

### `.github/workflows/deploy-digitalocean.yml`

**Purpose:** Auto-merge to deploy branch after CI success

**Trigger:**

```yaml
on:
  workflow_run:
    workflows: ['CI Pipeline']
    types: [completed]
    branches: [main]
```

**Condition:**

```yaml
if: ${{ github.event.workflow_run.conclusion == 'success' }}
```

**Action:**

- Merges `main` into `deploy`
- Pushes to `deploy` branch
- DigitalOcean auto-deploys

---

## DigitalOcean Setup

### App Platform Configuration

- **Source:** GitHub repository
- **Branch:** `deploy` (not main!)
- **Auto-deploy:** ✅ Enabled
- **Build command:** `npm ci && npm run build`
- **Run command:** `node dist/main.js`

### What Happens

1. DigitalOcean watches the `deploy` branch
2. When `deploy` branch is updated → triggers build
3. Runs build command
4. Deploys to production
5. Updates live URL

---

## Developer Workflow

### Normal Development

```bash
# 1. Make changes on main
git checkout main
git pull origin main

# 2. Create feature branch (optional)
git checkout -b feature/my-feature

# 3. Make changes, commit
git add .
git commit -m "feat: add new feature"

# 4. Push to main (or create PR)
git push origin main

# 5. GitHub Actions automatically:
#    - Runs CI tests
#    - If pass: merges to deploy
#    - DigitalOcean deploys
```

### Monitoring Deployment

**GitHub Actions:**

```
Repository → Actions tab
- "CI Pipeline" - Should be green ✅
- "Auto-Merge to Deploy Branch" - Should run after CI
```

**DigitalOcean:**

```
Apps → Your app → Activity
- See new deployment with timestamp
- Check build logs
- Verify deployment success
```

---

## Troubleshooting

### Deployment not triggering

**Check 1: CI passed?**

```bash
# Go to GitHub → Actions
# Verify "CI Pipeline" shows green checkmark
```

**Check 2: Auto-merge ran?**

```bash
# Go to GitHub → Actions
# Verify "Auto-Merge to Deploy Branch" ran after CI
```

**Check 3: Deploy branch updated?**

```bash
git fetch origin
git log origin/deploy
# Should show recent merge commit
```

**Check 4: DigitalOcean connected?**

```
# DigitalOcean → Your app → Settings
# Verify branch is set to "deploy"
# Verify "Auto-deploy" is enabled
```

### Emergency: Bypass CI (not recommended!)

If you absolutely must deploy without CI:

```bash
# ⚠️ USE ONLY IN EMERGENCIES
git checkout deploy
git merge main
git push origin deploy
# DigitalOcean will deploy immediately
```

### Rollback to Previous Version

```bash
# Option 1: Revert in main, let CI/CD handle it
git revert <bad-commit-hash>
git push origin main
# CI runs → Auto-merges → Deploys

# Option 2: Emergency rollback (bypasses CI)
git checkout deploy
git reset --hard <good-commit-hash>
git push --force origin deploy
# ⚠️ This triggers immediate deployment without testing!
```

---

## Security Considerations

### Branch Protection Rules (Recommended)

**For `main` branch:**

- ✅ Require pull request reviews
- ✅ Require status checks to pass (CI Pipeline)
- ✅ Require branches to be up to date

**For `deploy` branch:**

- ✅ Restrict push access
- ✅ Allow GitHub Actions only
- ⚠️ Never allow direct pushes from developers

### Setting Up Branch Protection

```
Repository → Settings → Branches → Add rule

Branch name pattern: deploy
☑️ Restrict who can push to matching branches
  → Add: github-actions[bot]
☑️ Do not allow bypassing the above settings
```

---

## Monitoring & Alerts

### GitHub Actions Notifications

- ✅ Email on workflow failure
- ✅ Slack/Discord webhooks (optional)
- ✅ Status badges in README

### DigitalOcean Alerts

- ✅ Deployment success/failure emails
- ✅ App health checks
- ✅ Resource usage alerts

---

## Summary

**What you get:**

- ✅ Automated testing on every push
- ✅ Safe deployments (only tested code)
- ✅ Simple Git workflow
- ✅ No manual deployment steps
- ✅ Easy rollbacks
- ✅ Clear separation of dev/production

**What you need to do:**

- Push to `main` branch
- Everything else is automated!

**What you should NOT do:**

- ❌ Push directly to `deploy` branch
- ❌ Disable CI checks
- ❌ Skip tests in CI

---

## Questions?

See the main [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for detailed setup instructions.
