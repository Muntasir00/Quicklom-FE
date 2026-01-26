# Branch Protection and Deployment Strategy

## Overview

This repository uses a protected branching strategy:
- **`main`** branch → Production deployments (requires PR)
- **`dev`** branch → Development deployments (direct push allowed)

---

## Deployment Strategy

### Development (dev branch)
- **Trigger:** Push to `dev` branch
- **Environment:** Development/Staging
- **Backend:** https://quicklocum-backend-dev-imx2emzrfa-nn.a.run.app
- **Frontend:** Firebase Hosting preview channel
- **Stripe:** Test keys (pk_test_...)
- **Purpose:** Testing new features before production

### Production (main branch)
- **Trigger:** Merge PR to `main` branch
- **Environment:** Production/Live
- **Backend:** Production backend URL (when available)
- **Frontend:** https://backend-quicklocum.web.app
- **Stripe:** Live keys (pk_live_...)
- **Purpose:** Live customer-facing application

---

## Step 1: Set Up Branch Protection Rules

### Protect main branch:

1. **Go to GitHub Repository Settings:**
   ```
   https://github.com/YOUR_USERNAME/YOUR_REPO/settings/branches
   ```

2. **Click "Add branch protection rule"**

3. **Configure protection for `main`:**
   - **Branch name pattern:** `main`

   **Required settings:**
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: `1` (or more if you have a team)
     - ✅ Dismiss stale pull request approvals when new commits are pushed

   - ✅ **Require status checks to pass before merging**
     - ✅ Require branches to be up to date before merging
     - Add status checks: `build-and-deploy-production`

   - ✅ **Require conversation resolution before merging**

   - ✅ **Do not allow bypassing the above settings**

   - ❌ **Allow force pushes** (keep disabled)
   - ❌ **Allow deletions** (keep disabled)

4. **Click "Create" or "Save changes"**

### Keep dev branch unprotected:
- `dev` branch should **NOT** have protection rules
- Allows direct pushes for faster development

---

## Step 2: Configure GitHub Secrets

### Production Secrets (for main branch):
```
FIREBASE_SERVICE_ACCOUNT     - Firebase service account JSON
VITE_API_BASE_URL_PROD       - Production backend URL
VITE_STRIPE_PUBLIC_KEY       - Live Stripe key (pk_live_...)
```

### Development Secrets (for dev branch):
```
FIREBASE_SERVICE_ACCOUNT        - Same Firebase service account JSON
VITE_API_BASE_URL_DEV          - Dev backend URL (Cloud Run dev)
VITE_STRIPE_PUBLIC_KEY_TEST    - Test Stripe key (pk_test_...)
```

### Add secrets:
```
Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions

Add these secrets:
1. FIREBASE_SERVICE_ACCOUNT
   Value: [Firebase service account JSON]

2. VITE_API_BASE_URL_PROD
   Value: https://your-production-backend.com

3. VITE_API_BASE_URL_DEV
   Value: https://quicklocum-backend-dev-imx2emzrfa-nn.a.run.app

4. VITE_STRIPE_PUBLIC_KEY
   Value: pk_live_YOUR_KEY

5. VITE_STRIPE_PUBLIC_KEY_TEST
   Value: pk_test_YOUR_KEY
```

---

## Workflow Explained

### Development Workflow:
```bash
# 1. Work on dev branch
git checkout dev

# 2. Make changes
# ... edit files ...

# 3. Commit and push directly to dev
git add .
git commit -m "feat: add new feature"
git push origin dev

# 4. Automatic deployment to dev environment
# ✅ Deploys to Firebase preview channel
# ✅ Uses dev backend URL
# ✅ Uses test Stripe keys
```

### Production Workflow:
```bash
# 1. Create a pull request from dev to main
git checkout dev
git pull origin dev

# Go to GitHub and create PR:
# https://github.com/YOUR_USERNAME/YOUR_REPO/compare/main...dev

# 2. Review changes in PR
# - Check all changes
# - Run tests
# - Get approval (if required)

# 3. Merge PR to main
# - Click "Merge pull request"
# - Confirm merge

# 4. Automatic deployment to production
# ✅ Deploys to live Firebase Hosting
# ✅ Uses production backend URL
# ✅ Uses live Stripe keys
```

---

## Step 3: Test the Protection

### Try to push directly to main (should fail):
```bash
git checkout main
git pull origin main

# Make a change
echo "test" >> test.txt
git add test.txt
git commit -m "test: direct push"
git push origin main

# Expected error:
# remote: error: GH006: Protected branch update failed for refs/heads/main.
# ❌ Direct push blocked!
```

### Push to dev (should work):
```bash
git checkout dev
git pull origin dev

# Make a change
echo "test" >> test.txt
git add test.txt
git commit -m "test: dev push"
git push origin dev

# Expected:
# ✅ Push successful!
# ✅ Workflow triggered
# ✅ Deployment to dev environment
```

---

## Common Commands

### Start new feature:
```bash
# Always work on dev branch
git checkout dev
git pull origin dev

# Create feature branch (optional)
git checkout -b feature/my-feature

# Work on feature
git add .
git commit -m "feat: implement feature"

# Push to dev
git checkout dev
git merge feature/my-feature
git push origin dev
```

### Deploy to production:
```bash
# Create PR on GitHub
# Wait for approval
# Merge PR

# Or via command line:
gh pr create --base main --head dev --title "Deploy to production" --body "Production deployment"
gh pr merge --auto --merge
```

### Rollback production:
```bash
# Revert the merge commit
git checkout main
git pull origin main
git revert -m 1 HEAD
git push origin main

# This creates a new commit that undoes the changes
# And triggers a new production deployment
```

---

## Firebase Hosting Channels

### Live channel (production):
- URL: https://backend-quicklocum.web.app
- Triggered by: Push to main
- Persistent: Yes

### Dev channel (development):
- URL: https://backend-quicklocum--dev-XXXXXX.web.app
- Triggered by: Push to dev
- Expires: 30 days
- Each deployment gets a unique URL

### View all channels:
```bash
firebase hosting:channel:list

# Or in Firebase Console:
# https://console.firebase.google.com/project/backend-quicklocum/hosting
```

---

## Troubleshooting

### Can't push to main:
**Symptom:** `error: GH006: Protected branch update failed`

**Solution:** This is expected! Create a pull request instead:
```bash
# On GitHub
# 1. Go to Pull Requests tab
# 2. Click "New pull request"
# 3. Base: main, Compare: dev
# 4. Create pull request
# 5. Get approval and merge
```

### Workflow doesn't trigger:
**Symptom:** No deployment after push

**Solution:**
1. Check you pushed to correct branch (dev or main)
2. Go to Actions tab to see workflow status
3. Check workflow file is in `.github/workflows/`
4. Verify branch names match in workflow file

### Deployment fails:
**Symptom:** Red X in Actions tab

**Solution:**
1. Click on failed workflow
2. Read error messages
3. Common issues:
   - Missing GitHub secrets
   - Firebase service account expired
   - Build errors in code

---

## Summary

### ✅ What's Protected:
- `main` branch requires pull request
- Can't push directly to main
- Must have approvals before merge
- Tests must pass before merge

### ✅ What's Not Protected:
- `dev` branch allows direct push
- Fast iteration for development
- No approval needed

### ✅ Deployment Behavior:
- **Dev → dev branch** → Firebase preview channel
- **Prod → main branch** → Firebase live site

---

## Next Steps

1. ✅ Set up branch protection rules
2. ✅ Add all required GitHub secrets
3. ✅ Test pushing to dev branch
4. ✅ Test creating PR to main
5. ✅ Verify production deployment works

**Important:** Make sure you have both production and development backend URLs ready before deploying!
