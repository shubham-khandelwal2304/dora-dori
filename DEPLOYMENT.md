# 🚀 Dora Dori AI - Vercel Deployment Guide

## Prerequisites

- GitHub account with your code pushed
- Vercel account (free tier available)
- Supabase database already set up

---

## Step 1: Prepare Environment Variables

Before deploying, make sure you have these values ready:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Your Supabase PostgreSQL connection string | `postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres` |
| `MASTER_TABLE_NAME` | The main inventory table name | `inventory_data` |

### Where to find DATABASE_URL:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (URI format)
5. Replace `[YOUR-PASSWORD]` with your actual database password

---

## Step 2: Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your repositories

---

## Step 3: Import Your Project

1. From Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Find your repository: `Dora-dori-new`
3. Click **"Import"**

---

## Step 4: Configure Build Settings

On the configuration screen:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (leave as root) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

---

## Step 5: Add Environment Variables ⚠️ CRITICAL

Click **"Environment Variables"** and add:

### Required Variables:

```
DATABASE_URL = postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
MASTER_TABLE_NAME = inventory_data
NODE_ENV = production
```

> ⚠️ **IMPORTANT:** Never commit credentials to GitHub. Always use environment variables!

---

## Step 6: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build
3. Your app will be live at: `https://your-project.vercel.app`

---

## Post-Deployment

### Verify Deployment:
- [ ] Dashboard loads with KPIs
- [ ] Charts display data
- [ ] Master Table shows inventory
- [ ] Insights section works
- [ ] Chatbot responds

### Custom Domain (Optional):
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Troubleshooting

### Build Errors:
```bash
# Test build locally first
npm run build
```

### API/Database Errors:
1. Check Vercel Dashboard → **Deployments** → **Functions** → **Logs**
2. Verify `DATABASE_URL` is correctly set
3. Ensure Supabase allows connections from Vercel IPs

### 404 Errors:
- Check that all files are committed and pushed
- Verify build output in Vercel logs

---

## Environment Variables Security

✅ **Current Setup:**
- All credentials are read from environment variables
- No hardcoded passwords in code
- `.env.local` is gitignored

### Local Development:
Create a `.env.local` file in the root directory:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
MASTER_TABLE_NAME=inventory_data
```

> ⚠️ **Never commit `.env.local` to Git!**

---

## Pricing

| Plan | Cost | Includes |
|------|------|----------|
| Hobby (Free) | $0/month | 100GB bandwidth, unlimited deploys, automatic HTTPS |
| Pro | $20/month | Team features, analytics, priority support |

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connection from Supabase dashboard
4. Check browser console for frontend errors

---

**Happy Deploying! 🎉**

