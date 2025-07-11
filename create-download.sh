#!/bin/bash

echo "📦 Creating DevTracker App Download Package..."

# Create a temporary directory for the package
mkdir -p devtracker-app-package

# Copy all necessary files
echo "📁 Copying application files..."

# Copy main application files
cp -r client devtracker-app-package/
cp -r server devtracker-app-package/
cp -r shared devtracker-app-package/

# Copy configuration files
cp package.json devtracker-app-package/
cp package-lock.json devtracker-app-package/
cp vite.config.ts devtracker-app-package/
cp tsconfig.json devtracker-app-package/
cp tailwind.config.ts devtracker-app-package/
cp postcss.config.js devtracker-app-package/
cp drizzle.config.ts devtracker-app-package/
cp components.json devtracker-app-package/

# Copy deployment files
cp DEPLOY.md devtracker-app-package/
cp WHITE_SCREEN_FIX.md devtracker-app-package/
cp DEPLOYMENT_FIX.md devtracker-app-package/
cp build-static.js devtracker-app-package/
cp deploy-fix.js devtracker-app-package/

# Create a README for the package
cat > devtracker-app-package/README-DEPLOYMENT.md << 'EOF'
# DevTracker App - Deployment Package

This package contains your complete DevTracker application ready for deployment on any hosting platform.

## Quick Deploy Options

### Option 1: Netlify (Easiest)
1. Go to netlify.com
2. Drag the entire `devtracker-app-package` folder to the deploy area
3. Or connect your GitHub repo and auto-deploy

### Option 2: Vercel
1. Upload to GitHub
2. Connect at vercel.com
3. Auto-deploys on every push

### Option 3: Static Build
```bash
npm install
node build-static.js
# Upload the `dist` folder to any static host
```

### Option 4: Full Stack Deploy
```bash
npm install
npm run dev
# Deploy as Node.js app
```

## App Features
- ✅ Project tracking with multiple phases
- ✅ Unit profitability calculator  
- ✅ PDF export functionality
- ✅ Data import/export
- ✅ localStorage data persistence
- ✅ Responsive design

## Technical Stack
- Frontend: React + TypeScript + Vite
- UI: Radix UI + Tailwind CSS + shadcn/ui
- State: TanStack Query + localStorage
- Build: Vite + ESBuild

## Support
Your app is fully functional and self-contained. All data is stored in browser localStorage, so no database setup is required.

For deployment issues, check WHITE_SCREEN_FIX.md in this package.
EOF

# Create .gitignore for the package
cat > devtracker-app-package/.gitignore << 'EOF'
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
.cache/
.replit
.upm/
.config/
.local/
EOF

echo "✅ Package created successfully!"
echo "📁 Location: devtracker-app-package/"
echo ""
echo "📋 Next steps:"
echo "1. Download the 'devtracker-app-package' folder"
echo "2. Upload to your preferred hosting service"
echo "3. Follow instructions in README-DEPLOYMENT.md"
echo ""
echo "🌐 Recommended hosts:"
echo "   - Netlify (drag & drop)"
echo "   - Vercel (GitHub integration)"
echo "   - Firebase Hosting"
echo "   - AWS S3 + CloudFront"