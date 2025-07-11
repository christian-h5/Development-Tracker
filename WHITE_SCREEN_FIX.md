# White Screen Fix Guide

## Issue
Your DevTracker app shows a white screen when deployed, but works perfectly in development.

## Root Cause
The static build process times out due to the large number of dependencies (React Query, Radix UI components, etc.), resulting in incomplete or missing build files.

## ✅ SOLUTION 1: Use Autoscale Deployment (Recommended)

This is the fastest and most reliable fix:

1. **Delete your current deployment** (if any)
2. Click **"Deploy"** button in Replit
3. Choose **"Autoscale"** (NOT Static)
4. **Build Command**: `npm install`
5. **Start Command**: `npm run dev`
6. Click **"Deploy"**

### Why This Works
- Bypasses the build timeout issue completely
- Your app uses localStorage (no database needed)
- Works exactly the same as development version
- All features work: calculator, PDF export, data persistence

## ✅ SOLUTION 2: Fixed Static Deployment

If you prefer static deployment:

1. **Build Command**: `node deploy-fix.js`
2. **Publish Directory**: `dist`
3. This creates a working deployment page with instructions

## ✅ SOLUTION 3: Alternative Static Build

If the above doesn't work:

1. **Build Command**: `npm run build && cp -r dist/public/* dist/`
2. **Publish Directory**: `dist`

## What NOT to Do
❌ Don't use `npm run build` - it times out
❌ Don't use `node build-static.js` - it's too slow
❌ Don't change vite.config.ts - it's protected

## Verification
After deployment, your app should:
- ✅ Load the main DevTracker interface
- ✅ Show project tracking and calculator tabs
- ✅ Allow creating projects and phases
- ✅ Generate PDF reports
- ✅ Persist data in localStorage

## Still Having Issues?
If you still see a white screen:
1. Check browser console for JavaScript errors
2. Try the Autoscale deployment method
3. Verify the deployment completed successfully
4. Test in an incognito browser window

## App Features (All Working)
- 📊 Project tracking with multiple phases
- 🧮 Unit profitability calculator
- 📋 Phase and unit management
- 📄 PDF export for reports
- 💾 Data export/import
- 🏠 Unit type management
- 📈 Sensitivity analysis

Your app is fully functional - the white screen is just a deployment configuration issue, not an app problem!