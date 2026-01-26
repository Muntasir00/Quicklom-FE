# QuickLocum Frontend Deployment Guide

## 🚀 Deployment Architecture

- **Frontend**: Firebase Hosting (React + Vite)
- **Backend**: Cloud Run
- **Domain**: Hostinger (custom domain)

---

## 📋 Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Google Cloud project: `backend-quicklocum`
3. GitHub repository for frontend
4. Domain name from Hostinger

---

## 🔧 Step 1: Firebase Setup

### 1.1 Initialize Firebase in your project

```bash
cd frontend_quicklocum

# Login to Firebase
firebase login

# Initialize Firebase Hosting
firebase init hosting
```

When prompted:
- ✅ Select: **Hosting**
- ✅ Project: **backend-quicklocum** (use existing project)
- ✅ Public directory: **dist**
- ✅ Configure as single-page app: **Yes**
- ✅ Set up automatic builds with GitHub: **No** (we'll use GitHub Actions)
- ✅ Overwrite index.html: **No**

### 1.2 Get Firebase Service Account

```bash
# Create service account for GitHub Actions
firebase login:ci
```

Copy the token - you'll need it for GitHub secrets.

---

## 🔑 Step 2: Configure GitHub Secrets

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Add these secrets:

### Required Secrets:

1. **`FIREBASE_SERVICE_ACCOUNT`**
   - Get from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
   - Value: Entire JSON content

2. **`VITE_API_BASE_URL`**
   - Value: Your Cloud Run backend URL
   - Example: `https://quicklocum-backend-dev-xxxxx.run.app`

3. **`VITE_STRIPE_PUBLIC_KEY`**
   - Value: Your Stripe publishable key
   - Get from: https://dashboard.stripe.com/apikeys

---

## 🌐 Step 3: Enable Firebase Hosting

### 3.1 Enable Firebase Hosting in Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/backend-quicklocum/hosting)
2. Click "Get Started" on Hosting
3. Follow the setup wizard

### 3.2 Deploy manually (first time)

```bash
# Build the app
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

Your site will be live at: `https://backend-quicklocum.web.app`

---

## 🔗 Step 4: Configure Custom Domain with Hostinger

### 4.1 In Firebase Console

1. Go to: **Hosting → Custom domain**
2. Click "**Add custom domain**"
3. Enter your domain (e.g., `quicklocum.ca` or `www.quicklocum.ca`)
4. Firebase will show you DNS records to add

### 4.2 In Hostinger Dashboard

1. Login to [Hostinger](https://www.hostinger.com/)
2. Go to: **Domains → Manage → DNS / Nameservers**
3. Add the DNS records provided by Firebase:

**For root domain (quicklocum.ca):**
```
Type: A
Name: @
Value: (IP addresses from Firebase)
TTL: 3600
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: (provided by Firebase)
TTL: 3600
```

**For SSL verification (TXT record):**
```
Type: TXT
Name: (provided by Firebase)
Value: (token from Firebase)
TTL: 3600
```

### 4.3 Wait for DNS Propagation

- DNS changes can take **24-48 hours**
- Check status in Firebase Console
- Firebase will automatically provision SSL certificate

---

## 🤖 Step 5: Automated Deployments

The GitHub Actions workflow is already set up! Now:

1. **Push to main branch** triggers automatic deployment
2. **Manual trigger** via GitHub Actions tab
3. **View deployment** in Firebase Console

### Workflow Steps:
1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies
4. ✅ Build with production env vars
5. ✅ Deploy to Firebase Hosting
6. ✅ SSL enabled automatically

---

## 🧪 Step 6: Test Your Deployment

### Get your backend URL:
```bash
gcloud run services describe quicklocum-backend-dev \
  --region=northamerica-northeast1 \
  --format="value(status.url)"
```

### Test the frontend:
1. Open your Firebase URL or custom domain
2. Check browser console for API calls
3. Test login with: `admin@admin.com` / `123456`
4. Verify API connectivity

---

## 📊 Monitoring & Logs

### Firebase Console
- **Usage**: https://console.firebase.google.com/project/backend-quicklocum/hosting/sites
- **Analytics**: Built-in traffic analytics
- **Performance**: Page load metrics

### View Deployment Logs
```bash
firebase hosting:channel:list
```

---

## 🔄 Update Environment Variables

To update API URL or other env vars:

1. Update GitHub Secrets
2. Push a new commit or trigger workflow manually
3. Firebase will redeploy with new variables

---

## 💡 Tips

### Force Cache Clear
```bash
firebase hosting:channel:deploy preview --expires 1h
```

### Preview Deployment
```bash
npm run build
firebase hosting:channel:deploy preview
```

### Rollback Deployment
Go to Firebase Console → Hosting → Release history → Restore

---

## 🆘 Troubleshooting

### Issue: Build fails in GitHub Actions
**Solution**: Check that all secrets are set correctly

### Issue: API calls fail (CORS errors)
**Solution**: Update backend CORS settings to include your domain

### Issue: Custom domain not working
**Solution**: Wait 24-48h for DNS propagation, verify DNS records in Hostinger

### Issue: SSL certificate pending
**Solution**: Firebase auto-provisions SSL, wait up to 24h after DNS verification

---

## 📱 DNS Configuration Summary

| Record Type | Name | Value | Purpose |
|-------------|------|-------|---------|
| A | @ | Firebase IPs | Root domain |
| CNAME | www | Firebase URL | WWW subdomain |
| TXT | _acme-challenge | Token | SSL verification |

---

## ✅ Checklist

- [ ] Firebase project initialized
- [ ] GitHub secrets configured
- [ ] First manual deployment successful
- [ ] Custom domain added in Firebase
- [ ] DNS records added in Hostinger
- [ ] SSL certificate active
- [ ] Automated deployment working
- [ ] Backend API connected
- [ ] Login functionality tested

---

🎉 **Your frontend is now live and automatically deployed on every push to main!**
