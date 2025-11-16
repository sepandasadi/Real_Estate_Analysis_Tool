# Deployment Guide - Real Estate Analysis Tool PWA

This guide walks you through deploying the Google Apps Script backend and connecting it to the React PWA frontend.

## Prerequisites

- Google Account with access to Google Apps Script
- Node.js and npm installed
- Git installed

---

## Part 1: Deploy Google Apps Script Backend

### Step 1: Open Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Open your existing Real Estate Analysis Tool project
3. Verify all files are present in the `google-apps-script/` directory

### Step 2: Deploy as Web App

1. In the Apps Script Editor, click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Select **Web app**
4. Configure the deployment:
   - **Description**: `Real Estate Analysis Tool API v3.0`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone`
5. Click **Deploy**
6. **IMPORTANT**: Copy the **Web App URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
7. Save this URL - you'll need it for the frontend configuration

### Step 3: Test the Backend

Test the health check endpoint:

```bash
curl https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

You should see a response like:
```json
{
  "status": "ok",
  "message": "Real Estate Analysis Tool API",
  "version": "3.0",
  "timestamp": "2025-11-15T22:11:00.000Z"
}
```

---

## Part 2: Configure Frontend

### Step 1: Create Environment File

1. Navigate to the `web-app/` directory:
   ```bash
   cd web-app
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and replace `YOUR_SCRIPT_ID` with your actual Web App URL:
   ```env
   VITE_API_URL=https://script.google.com/macros/s/AKfycbx.../exec
   VITE_APP_NAME=Real Estate Analysis Tool
   VITE_APP_VERSION=3.0
   ```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Test Locally

Start the development server:

```bash
npm run dev
```

The app should open at `http://localhost:3000`

### Step 4: Test API Connection

1. Open the app in your browser
2. Check the browser console for any errors
3. The API Usage banner should display real data from the backend
4. Try submitting a property analysis to verify the connection

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account (free)

### Step 2: Push to GitHub

If you haven't already:

```bash
git add .
git commit -m "Configure API connection"
git push origin main
```

### Step 3: Import Project to Vercel

1. In Vercel dashboard, click **Add New** > **Project**
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `web-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 4: Add Environment Variables

In Vercel project settings:

1. Go to **Settings** > **Environment Variables**
2. Add the following variables:
   - `VITE_API_URL`: Your Google Apps Script Web App URL
   - `VITE_APP_NAME`: Real Estate Analysis Tool
   - `VITE_APP_VERSION`: 3.0

### Step 5: Deploy

1. Click **Deploy**
2. Wait for the build to complete (1-2 minutes)
3. Your app will be live at: `https://your-project.vercel.app`

---

## Part 4: Test Production Deployment

### Test Checklist

- [ ] App loads without errors
- [ ] API Usage banner displays real data
- [ ] Property form submits successfully
- [ ] Analysis results display correctly
- [ ] PWA install prompt appears (on mobile)
- [ ] App works offline (after first visit)

### Common Issues

**Issue**: API requests fail with CORS errors
- **Solution**: Verify the Web App is deployed with "Who has access: Anyone"

**Issue**: Environment variables not working
- **Solution**: Redeploy in Vercel after adding environment variables

**Issue**: Build fails in Vercel
- **Solution**: Check that `web-app` is set as the root directory

---

## Part 5: Update Deployment (Future Changes)

### Update Backend (Google Apps Script)

1. Make changes in Apps Script Editor
2. Click **Deploy** > **Manage deployments**
3. Click the pencil icon ✏️ next to your deployment
4. Select **New version**
5. Click **Deploy**

**Note**: The Web App URL stays the same, no frontend changes needed

### Update Frontend

1. Make changes locally
2. Test with `npm run dev`
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
4. Vercel will automatically deploy the changes

---

## Part 6: Custom Domain (Optional)

### Add Custom Domain in Vercel

1. Go to **Settings** > **Domains**
2. Add your domain (e.g., `realestate.yourdomain.com`)
3. Follow Vercel's DNS configuration instructions
4. Wait for DNS propagation (5-60 minutes)

---

## Monitoring & Maintenance

### Check API Usage

Monitor your API usage in Google Apps Script:

1. Open Apps Script Editor
2. Go to **File** > **Project properties** > **Script properties**
3. Check properties starting with `api_usage_`

### View Logs

**Backend Logs (Google Apps Script):**
1. In Apps Script Editor, click **Executions**
2. View recent API calls and errors

**Frontend Logs (Vercel):**
1. In Vercel dashboard, go to your project
2. Click **Deployments** > Select deployment > **Functions**
3. View runtime logs

---

## Security Notes

- The Google Apps Script Web App URL is public but requires no authentication
- All API keys (RapidAPI, Gemini, Bridge) are stored securely in Google Apps Script properties
- Never commit `.env` file to Git (it's in `.gitignore`)
- The frontend only communicates with your Google Apps Script backend

---

## Support

For issues or questions:
- Check the [README.md](../README.md)
- Review the [MIGRATION_PLAN.md](../MIGRATION_PLAN.md)
- Check Google Apps Script logs for backend errors
- Check browser console for frontend errors

---

**Last Updated**: November 15, 2025
**Version**: 3.0
